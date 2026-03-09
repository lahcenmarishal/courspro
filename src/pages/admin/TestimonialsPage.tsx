import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useLanguage } from "@/hooks/useLanguage";
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, uploadTestimonialImage, Testimonial, TestimonialInsert } from "@/hooks/useTestimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star, Loader2, Upload, Image } from "lucide-react";
import { toast } from "sonner";

const defaultFormData: Omit<TestimonialInsert, 'rating' | 'is_featured' | 'is_published' | 'display_order'> & { rating: number; is_featured: boolean; is_published: boolean; display_order: number } = {
  name: '',
  name_ar: '',
  role: '',
  role_ar: '',
  content: '',
  content_ar: '',
  image_url: '',
  rating: 5,
  is_featured: false,
  is_published: false,
  display_order: 0,
};

export default function AdminTestimonialsPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { data: testimonials, isLoading } = useTestimonials(false);
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      name_ar: testimonial.name_ar || '',
      role: testimonial.role,
      role_ar: testimonial.role_ar || '',
      content: testimonial.content,
      content_ar: testimonial.content_ar || '',
      image_url: testimonial.image_url || '',
      rating: testimonial.rating,
      is_featured: testimonial.is_featured,
      is_published: testimonial.is_published,
      display_order: testimonial.display_order,
    });
    setEditingId(testimonial.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      await deleteTestimonial.mutateAsync(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى اختيار صورة' : 'Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadTestimonialImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      toast.success(isArabic ? 'تم تحديث الصورة' : 'Image mise à jour');
    } catch (error) {
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.content) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
      return;
    }

    const payload: TestimonialInsert = {
      name: formData.name,
      name_ar: formData.name_ar || null,
      role: formData.role,
      role_ar: formData.role_ar || null,
      content: formData.content,
      content_ar: formData.content_ar || null,
      image_url: formData.image_url || null,
      rating: formData.rating,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
      display_order: formData.display_order,
    };

    if (editingId) {
      await updateTestimonial.mutateAsync({ id: editingId, ...payload });
    } else {
      await createTestimonial.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background flex" dir={isArabic ? 'rtl' : 'ltr'}>
      <DashboardSidebar role="admin" />
      
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {isArabic ? 'إدارة الشهادات' : 'Gestion des témoignages'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isArabic ? 'إضافة وتعديل آراء العملاء' : 'Ajouter et modifier les avis clients'}
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? 'إضافة شهادة' : 'Ajouter'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId 
                      ? (isArabic ? 'تعديل الشهادة' : 'Modifier le témoignage')
                      : (isArabic ? 'إضافة شهادة جديدة' : 'Nouveau témoignage')
                    }
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الاسم (فرنسي)' : 'Nom (FR)'} *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الاسم (عربي)' : 'Nom (AR)'}</Label>
                      <Input
                        value={formData.name_ar || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                        placeholder="جان دوبون"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الدور (فرنسي)' : 'Rôle (FR)'} *</Label>
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Parent d'élève"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الدور (عربي)' : 'Rôle (AR)'}</Label>
                      <Input
                        value={formData.role_ar || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, role_ar: e.target.value }))}
                        placeholder="ولي أمر"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? 'المحتوى (فرنسي)' : 'Contenu (FR)'} *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Témoignage du client..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? 'المحتوى (عربي)' : 'Contenu (AR)'}</Label>
                    <Textarea
                      value={formData.content_ar || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, content_ar: e.target.value }))}
                      placeholder="شهادة العميل..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? 'الصورة' : 'Photo'}</Label>
                    <div className="flex items-center gap-4">
                      {formData.image_url ? (
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={formData.image_url} />
                          <AvatarFallback><Image className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                            <span>
                              {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              {isArabic ? 'رفع صورة' : 'Télécharger'}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'التقييم' : 'Note'}</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                rating <= formData.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'ترتيب العرض' : 'Ordre d\'affichage'}</Label>
                      <Input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                      />
                      <Label>{isArabic ? 'مميز' : 'En vedette'}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                      />
                      <Label>{isArabic ? 'منشور' : 'Publié'}</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        {isArabic ? 'إلغاء' : 'Annuler'}
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={createTestimonial.isPending || updateTestimonial.isPending}>
                      {(createTestimonial.isPending || updateTestimonial.isPending) && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      {editingId 
                        ? (isArabic ? 'تحديث' : 'Mettre à jour')
                        : (isArabic ? 'إضافة' : 'Ajouter')
                      }
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'قائمة الشهادات' : 'Liste des témoignages'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : testimonials && testimonials.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? 'الصورة' : 'Photo'}</TableHead>
                      <TableHead>{isArabic ? 'الاسم' : 'Nom'}</TableHead>
                      <TableHead>{isArabic ? 'الدور' : 'Rôle'}</TableHead>
                      <TableHead>{isArabic ? 'التقييم' : 'Note'}</TableHead>
                      <TableHead>{isArabic ? 'الحالة' : 'Statut'}</TableHead>
                      <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={testimonial.image_url || undefined} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{testimonial.name}</TableCell>
                        <TableCell>{testimonial.role}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {testimonial.is_published ? (
                              <Badge variant="default">{isArabic ? 'منشور' : 'Publié'}</Badge>
                            ) : (
                              <Badge variant="secondary">{isArabic ? 'مسودة' : 'Brouillon'}</Badge>
                            )}
                            {testimonial.is_featured && (
                              <Badge variant="outline" className="border-amber-500 text-amber-600">
                                {isArabic ? 'مميز' : 'Vedette'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(testimonial.id)}
                              disabled={deleteTestimonial.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'لا توجد شهادات' : 'Aucun témoignage'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
