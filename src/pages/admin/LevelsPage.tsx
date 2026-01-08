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
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const levelSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().max(500).optional(),
  order_index: z.number().int().min(0).max(100),
});

type Level = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

export default function LevelsPage() {
  const { role } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error("Erreur lors du chargement des niveaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setOrderIndex(levels.length);
    setEditingLevel(null);
  };

  const openEditDialog = (level: Level) => {
    setEditingLevel(level);
    setName(level.name);
    setDescription(level.description || "");
    setOrderIndex(level.order_index);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = levelSchema.safeParse({
        name,
        description: description || undefined,
        order_index: orderIndex,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      if (editingLevel) {
        const { error } = await supabase
          .from('levels')
          .update({
            name: validation.data.name,
            description: validation.data.description || null,
            order_index: validation.data.order_index,
          })
          .eq('id', editingLevel.id);

        if (error) throw error;
        toast.success("Niveau modifié avec succès");
      } else {
        const { error } = await supabase
          .from('levels')
          .insert({
            name: validation.data.name,
            description: validation.data.description || null,
            order_index: validation.data.order_index,
          });

        if (error) throw error;
        toast.success("Niveau créé avec succès");
      }

      setDialogOpen(false);
      resetForm();
      fetchLevels();
    } catch (error: any) {
      console.error('Error saving level:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce niveau ?")) return;

    try {
      const { error } = await supabase
        .from('levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Niveau supprimé");
      fetchLevels();
    } catch (error: any) {
      console.error('Error deleting level:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Gestion des niveaux</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Primaire, Collège, Lycée, etc.</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter un niveau</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingLevel ? "Modifier le niveau" : "Nouveau niveau"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du niveau *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Primaire, Collège, Lycée"
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
                <div className="space-y-2">
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingLevel ? "Modifier" : "Créer"}
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
        ) : levels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">Aucun niveau créé</h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              Commencez par créer vos niveaux scolaires
            </p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier niveau
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
              {levels.map((level) => (
                <div key={level.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{level.order_index}</span>
                      <span className="font-semibold text-foreground">{level.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(level)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(level.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {level.description && (
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.order_index}</TableCell>
                      <TableCell className="font-semibold">{level.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {level.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(level)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(level.id)}
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
