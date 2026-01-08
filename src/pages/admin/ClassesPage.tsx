import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  level_id: z.string().uuid("Veuillez sélectionner un niveau"),
  stream_id: z.string().uuid().optional().nullable(),
  school_year_id: z.string().uuid("Veuillez sélectionner une année scolaire"),
  capacity: z.number().int().min(1).max(100),
});

type Class = {
  id: string;
  name: string;
  level_id: string;
  stream_id: string | null;
  school_year_id: string;
  capacity: number;
  created_at: string;
  levels?: { name: string };
  streams?: { name: string } | null;
  school_years?: { name: string };
};

type Level = { id: string; name: string };
type Stream = { id: string; name: string; level_id: string };
type SchoolYear = { id: string; name: string; is_active: boolean };

export default function ClassesPage() {
  const { role } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  const [name, setName] = useState("");
  const [levelId, setLevelId] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [schoolYearId, setSchoolYearId] = useState("");
  const [capacity, setCapacity] = useState(30);

  const fetchData = async () => {
    try {
      const [classesRes, levelsRes, streamsRes, yearsRes] = await Promise.all([
        supabase.from('classes').select('*, levels(name), streams(name), school_years(name)').order('name'),
        supabase.from('levels').select('id, name').order('order_index'),
        supabase.from('streams').select('id, name, level_id').order('name'),
        supabase.from('school_years').select('id, name, is_active').order('start_date', { ascending: false }),
      ]);

      if (classesRes.error) throw classesRes.error;
      if (levelsRes.error) throw levelsRes.error;
      if (streamsRes.error) throw streamsRes.error;
      if (yearsRes.error) throw yearsRes.error;

      setClasses(classesRes.data || []);
      setLevels(levelsRes.data || []);
      setStreams(streamsRes.data || []);
      setSchoolYears(yearsRes.data || []);

      // Set default school year
      const activeYear = yearsRes.data?.find(y => y.is_active);
      if (activeYear) setSchoolYearId(activeYear.id);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStreams = streams.filter(s => s.level_id === levelId);

  const resetForm = () => {
    setName("");
    setLevelId("");
    setStreamId(null);
    setCapacity(30);
    const activeYear = schoolYears.find(y => y.is_active);
    if (activeYear) setSchoolYearId(activeYear.id);
    setEditingClass(null);
  };

  const openEditDialog = (cls: Class) => {
    setEditingClass(cls);
    setName(cls.name);
    setLevelId(cls.level_id);
    setStreamId(cls.stream_id);
    setSchoolYearId(cls.school_year_id);
    setCapacity(cls.capacity);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = classSchema.safeParse({
        name,
        level_id: levelId,
        stream_id: streamId || null,
        school_year_id: schoolYearId,
        capacity,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: validation.data.name,
            level_id: validation.data.level_id,
            stream_id: validation.data.stream_id,
            school_year_id: validation.data.school_year_id,
            capacity: validation.data.capacity,
          })
          .eq('id', editingClass.id);

        if (error) throw error;
        toast.success("Classe modifiée avec succès");
      } else {
        const { error } = await supabase
          .from('classes')
          .insert({
            name: validation.data.name,
            level_id: validation.data.level_id,
            stream_id: validation.data.stream_id,
            school_year_id: validation.data.school_year_id,
            capacity: validation.data.capacity,
          });

        if (error) throw error;
        toast.success("Classe créée avec succès");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving class:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Classe supprimée");
      fetchData();
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Gestion des classes</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Créez et gérez vos classes</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="w-full sm:w-auto" disabled={levels.length === 0 || schoolYears.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter une classe</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Modifier la classe" : "Nouvelle classe"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la classe *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: 6ème A, Terminale S1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Année scolaire *</Label>
                  <Select value={schoolYearId} onValueChange={setSchoolYearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.is_active && "(Active)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niveau *</Label>
                  <Select value={levelId} onValueChange={(val) => {
                    setLevelId(val);
                    setStreamId(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filteredStreams.length > 0 && (
                  <div className="space-y-2">
                    <Label>Filière (optionnel)</Label>
                    <Select value={streamId || ""} onValueChange={(val) => setStreamId(val || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une filière" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucune</SelectItem>
                        {filteredStreams.map((stream) => (
                          <SelectItem key={stream.id} value={stream.id}>
                            {stream.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité maximale</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingClass ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {levels.length === 0 && (
          <div className="mb-4 p-3 lg:p-4 bg-secondary/10 rounded-lg border border-secondary/30 text-secondary text-sm lg:text-base">
            ⚠️ Vous devez d'abord créer des niveaux avant de pouvoir créer des classes.
          </div>
        )}

        {schoolYears.length === 0 && (
          <div className="mb-4 p-3 lg:p-4 bg-secondary/10 rounded-lg border border-secondary/30 text-secondary text-sm lg:text-base">
            ⚠️ Vous devez d'abord créer une année scolaire avant de pouvoir créer des classes.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : classes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <Users className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">Aucune classe créée</h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              Commencez par créer vos classes
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Mobile: Card view */}
            <div className="lg:hidden divide-y divide-border">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{cls.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(cls)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(cls.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Niveau: {cls.levels?.name || "-"}</div>
                    <div>Filière: {cls.streams?.name || "-"}</div>
                    <div>Année: {cls.school_years?.name || "-"}</div>
                    <div>Capacité: {cls.capacity}</div>
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
                    <TableHead>Niveau</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-semibold">{cls.name}</TableCell>
                      <TableCell>{cls.levels?.name || "-"}</TableCell>
                      <TableCell>{cls.streams?.name || "-"}</TableCell>
                      <TableCell>{cls.school_years?.name || "-"}</TableCell>
                      <TableCell>{cls.capacity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(cls)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cls.id)}
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
