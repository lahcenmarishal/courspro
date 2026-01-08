import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().max(500).optional(),
  coefficient: z.number().min(0.5).max(10),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide"),
});

type Subject = {
  id: string;
  name: string;
  description: string | null;
  coefficient: number;
  color: string;
  created_at: string;
};

const defaultColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

export default function SubjectsPage() {
  const { role } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coefficient, setCoefficient] = useState(1);
  const [color, setColor] = useState("#3B82F6");

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCoefficient(1);
    setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
    setEditingSubject(null);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setDescription(subject.description || "");
    setCoefficient(subject.coefficient);
    setColor(subject.color);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = subjectSchema.safeParse({
        name,
        description: description || undefined,
        coefficient,
        color,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: validation.data.name,
            description: validation.data.description || null,
            coefficient: validation.data.coefficient,
            color: validation.data.color,
          })
          .eq('id', editingSubject.id);

        if (error) throw error;
        toast.success("Matière modifiée avec succès");
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({
            name: validation.data.name,
            description: validation.data.description || null,
            coefficient: validation.data.coefficient,
            color: validation.data.color,
          });

        if (error) throw error;
        toast.success("Matière créée avec succès");
      }

      setDialogOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Matière supprimée");
      fetchSubjects();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Gestion des matières</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Mathématiques, Français, Histoire, etc.</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter une matière</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Modifier la matière" : "Nouvelle matière"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la matière *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mathématiques"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description optionnelle"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coefficient">Coefficient</Label>
                    <Input
                      id="coefficient"
                      type="number"
                      step="0.5"
                      min={0.5}
                      max={10}
                      value={coefficient}
                      onChange={(e) => setCoefficient(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2 flex-wrap">
                      {defaultColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`h-8 w-8 rounded-lg transition-all ${
                            color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingSubject ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <BookOpen className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">Aucune matière créée</h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              Commencez par créer vos matières
            </p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer la première matière
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Mobile: Card view */}
            <div className="lg:hidden divide-y divide-border">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-6 w-6 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-semibold text-foreground">{subject.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(subject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Coefficient: {subject.coefficient}</span>
                    {subject.description && <p className="mt-1">{subject.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Couleur</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Coefficient</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div
                          className="h-6 w-6 rounded-lg"
                          style={{ backgroundColor: subject.color }}
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{subject.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {subject.description || "-"}
                      </TableCell>
                      <TableCell>{subject.coefficient}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(subject)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(subject.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
