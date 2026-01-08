import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Upload, 
  X, 
  Loader2, 
  Image as ImageIcon,
  FileUp,
  Trash2,
  Eye,
  EyeOff,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { 
  useCreateBlogPost, 
  useUpdateBlogPost,
  useAddBlogFile,
  useDeleteBlogFile,
  generateSlug,
  uploadBlogImage,
  uploadBlogFile,
  type BlogPost,
  type BlogCategory,
  type BlogFile
} from "@/hooks/useBlog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Le contenu est requis"),
  category_id: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
  published_at: z.date().optional().nullable(),
  scheduled_at: z.date().optional().nullable(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostEditorProps {
  post?: BlogPost | null;
  categories: BlogCategory[];
  onClose: () => void;
}

export function BlogPostEditor({ post, categories, onClose }: BlogPostEditorProps) {
  const { user } = useAuth();
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featured_image_url || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(post?.gallery_images || []);
  const [files, setFiles] = useState<BlogFile[]>(post?.files || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const addFile = useAddBlogFile();
  const deleteFile = useDeleteBlogFile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      category_id: post?.category_id || undefined,
      tags: post?.tags?.join(", ") || "",
      status: post?.status || "draft",
      published_at: post?.published_at ? new Date(post.published_at) : null,
      scheduled_at: post?.scheduled_at ? new Date(post.scheduled_at) : null,
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
    },
  });

  const watchTitle = form.watch("title");
  const watchStatus = form.watch("status");

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    if (!post) {
      form.setValue("slug", generateSlug(value));
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadBlogImage(file);
      setFeaturedImage(url);
      toast.success("Image uploadée");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setUploadingImage(true);
    try {
      const newImages: string[] = [];
      for (const file of Array.from(fileList)) {
        if (file.type.startsWith("image/")) {
          const url = await uploadBlogImage(file);
          newImages.push(url);
        }
      }
      setGalleryImages([...galleryImages, ...newImages]);
      toast.success("Images ajoutées à la galerie");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Seuls les fichiers PDF et Word sont autorisés");
      return;
    }

    setUploadingFile(true);
    try {
      const { url, size } = await uploadBlogFile(file);
      
      if (post) {
        // If editing, add file to database
        const result = await addFile.mutateAsync({
          post_id: post.id,
          file_name: file.name,
          file_url: url,
          file_type: file.type,
          file_size: size,
        });
        setFiles([...files, result]);
      } else {
        // If creating, store temporarily
        setFiles([
          ...files,
          {
            id: `temp-${Date.now()}`,
            post_id: "",
            file_name: file.name,
            file_url: url,
            file_type: file.type,
            file_size: size,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      toast.success("Fichier ajouté");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    if (fileId.startsWith("temp-")) {
      setFiles(files.filter((f) => f.id !== fileId));
    } else {
      await deleteFile.mutateAsync(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    const postData = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || null,
      content: values.content,
      featured_image_url: featuredImage,
      gallery_images: galleryImages,
      category_id: values.category_id || null,
      tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: values.status as "draft" | "published",
      published_at: values.status === "published" && values.published_at 
        ? values.published_at.toISOString() 
        : values.status === "published" 
          ? new Date().toISOString() 
          : null,
      scheduled_at: values.scheduled_at?.toISOString() || null,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      og_image_url: featuredImage,
    };

    try {
      if (post) {
        await updatePost.mutateAsync({ id: post.id, ...postData });
      } else {
        const newPost = await createPost.mutateAsync({ 
          ...postData, 
          author_id: user.id 
        });
        
        // Add files to the new post
        for (const file of files) {
          if (file.id.startsWith("temp-")) {
            await addFile.mutateAsync({
              post_id: newPost.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size || undefined,
            });
          }
        }
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Titre de l'article"
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">/blog/</span>
                      <Input {...field} placeholder="mon-article" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extrait</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Courte description de l'article..."
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    Affiché dans les aperçus et résultats de recherche
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="<p>Contenu de l'article en HTML...</p>"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Utilisez du HTML pour la mise en forme (h2, p, ul, strong, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Files Section */}
            <div className="space-y-3">
              <Label>Fichiers téléchargeables (PDF, Word)</Label>
              <div className="border rounded-lg p-4 space-y-3">
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm truncate">{file.file_name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="w-full"
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4 mr-2" />
                  )}
                  Ajouter un fichier
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Publication</h4>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2">
                      {field.value === "published" ? (
                        <>
                          <Eye className="h-4 w-4 text-accent" />
                          Publié
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Brouillon
                        </>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value === "published"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "published" : "draft")
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchStatus === "published" && (
                <FormField
                  control={form.control}
                  name="published_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de publication</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "PPP", { locale: fr })
                                : "Maintenant"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="tag1, tag2, tag3" />
                  </FormControl>
                  <FormDescription>Séparés par des virgules</FormDescription>
                </FormItem>
              )}
            />

            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Image principale</Label>
              <div className="border rounded-lg p-3">
                {featuredImage ? (
                  <div className="relative">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="rounded aspect-video object-cover w-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFeaturedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={featuredInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => featuredInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      )}
                      Ajouter une image
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2">
              <Label>Galerie d'images</Label>
              <div className="border rounded-lg p-3 space-y-3">
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="rounded aspect-square object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5"
                          onClick={() =>
                            setGalleryImages(galleryImages.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Ajouter des images
                </Button>
              </div>
            </div>

            {/* SEO */}
            <Accordion type="single" collapsible>
              <AccordionItem value="seo">
                <AccordionTrigger>SEO & Métadonnées</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={watchTitle} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createPost.isPending || updatePost.isPending}
          >
            {(createPost.isPending || updatePost.isPending) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {post ? "Mettre à jour" : "Créer l'article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
