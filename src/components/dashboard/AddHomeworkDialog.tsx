import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddHomeworkDialogProps {
  onHomeworkAdded: () => void;
}

export function AddHomeworkDialog({ onHomeworkAdded }: AddHomeworkDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("20");

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && user) {
      fetchTeacherOptions();
    }
  }, [open, user]);

  const fetchTeacherOptions = async () => {
    if (!user) return;

    const { data: assignments } = await supabase
      .from("teacher_assignments")
      .select("subject_id, class_id, subject:subjects(id, name), class:classes(id, name)")
      .eq("teacher_id", user.id);

    if (assignments) {
      const uniqueSubjects = new Map<string, { id: string; name: string }>();
      const uniqueClasses = new Map<string, { id: string; name: string }>();
      
      assignments.forEach((a: any) => {
        if (a.subject && !uniqueSubjects.has(a.subject.id)) {
          uniqueSubjects.set(a.subject.id, a.subject);
        }
        if (a.class && !uniqueClasses.has(a.class.id)) {
          uniqueClasses.set(a.class.id, a.class);
        }
      });

      setSubjects(Array.from(uniqueSubjects.values()));
      setClasses(Array.from(uniqueClasses.values()));
    }
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || !dueDate) {
      toast.error("Le titre et la date limite sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("homework").insert({
        title: title.trim(),
        description: description.trim() || null,
        subject_id: subjectId || null,
        class_id: classId || null,
        teacher_id: user.id,
        due_date: new Date(dueDate).toISOString(),
        max_score: parseInt(maxScore) || 20,
      });

      if (error) throw error;

      toast.success("Devoir créé avec succès");
      resetForm();
      setOpen(false);
      onHomeworkAdded();
    } catch (error: any) {
      console.error("Error adding homework:", error);
      toast.error("Erreur lors de la création du devoir");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubjectId("");
    setClassId("");
    setDueDate("");
    setMaxScore("20");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Créer un devoir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau devoir</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="hw-title">Titre *</Label>
            <Input
              id="hw-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du devoir"
            />
          </div>

          <div>
            <Label htmlFor="hw-desc">Description</Label>
            <Textarea
              id="hw-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Consignes du devoir"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Matière</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classe</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hw-date">Date limite *</Label>
              <Input
                id="hw-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hw-score">Note maximale</Label>
              <Input
                id="hw-score"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le devoir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
