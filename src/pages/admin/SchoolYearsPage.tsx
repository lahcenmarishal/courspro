import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schoolYearSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  start_date: z.string().min(1, "Date de début requise"),
  end_date: z.string().min(1, "Date de fin requise"),
  is_active: z.boolean(),
});

type SchoolYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

export default function SchoolYearsPage() {
  const { role } = useAuth();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<SchoolYear | null>(null);
  
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  const fetchSchoolYears = async () => {
    try {
      const { data, error } = await supabase
        .from('school_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSchoolYears(data || []);
    } catch (error) {
      console.error('Error fetching school years:', error);
      toast.error("Erreur lors du chargement des années scolaires");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setIsActive(false);
    setEditingYear(null);
  };

  const openEditDialog = (year: SchoolYear) => {
    setEditingYear(year);
    setName(year.name);
    setStartDate(year.start_date);
    setEndDate(year.end_date);
    setIsActive(year.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = schoolYearSchema.safeParse({
        name,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      // If setting as active, deactivate others first
      if (isActive) {
        await supabase
          .from('school_years')
          .update({ is_active: false })
          .neq('id', editingYear?.id || '');
      }

      if (editingYear) {
        const { error } = await supabase
          .from('school_years')
          .update({
            name: validation.data.name,
            start_date: validation.data.start_date,
            end_date: validation.data.end_date,
            is_active: validation.data.is_active,
          })
          .eq('id', editingYear.id);

        if (error) throw error;
        toast.success("Année scolaire modifiée avec succès");
      } else {
        const { error } = await supabase
          .from('school_years')
          .insert({
            name: validation.data.name,
            start_date: validation.data.start_date,
            end_date: validation.data.end_date,
            is_active: validation.data.is_active,
          });

        if (error) throw error;
        toast.success("Année scolaire créée avec succès");
      }

      setDialogOpen(false);
      resetForm();
      fetchSchoolYears();
    } catch (error: any) {
      console.error('Error saving school year:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette année scolaire ?")) return;

    try {
      const { error } = await supabase
        .from('school_years')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Année scolaire supprimée");
      fetchSchoolYears();
    } catch (error: any) {
      console.error('Error deleting school year:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Années scolaires</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Gérez vos années scolaires</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle année</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingYear ? "Modifier l'année" : "Nouvelle année scolaire"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: 2024-2025"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="isActive" className="text-base">Année active</Label>
                    <p className="text-sm text-muted-foreground">
                      Définir comme année scolaire en cours
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingYear ? "Modifier" : "Créer"}
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
        ) : schoolYears.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <Calendar className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">Aucune année scolaire</h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              Créez votre première année scolaire
            </p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une année
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
              {schoolYears.map((year) => (
                <div key={year.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{year.name}</span>
                      {year.is_active ? (
                        <Badge className="bg-accent text-accent-foreground text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(year)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(year.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(year.start_date).toLocaleDateString('fr-FR')} - {new Date(year.end_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell className="font-semibold">{year.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(year.start_date).toLocaleDateString('fr-FR')} - {new Date(year.end_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {year.is_active ? (
                          <Badge className="bg-accent text-accent-foreground">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(year)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(year.id)}
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
