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

interface AddResourceDialogProps {
  onResourceAdded: () => void;
}

export function AddResourceDialog({ onResourceAdded }: AddResourceDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && user) {
      fetchTeacherOptions();
    }
  }, [open, user]);

  const fetchTeacherOptions = async () => {
    if (!user) return;

    // Fetch subjects from teacher assignments
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
    if (!user || !title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("resources").insert({
        title: title.trim(),
        description: description.trim() || null,
        subject_id: subjectId || null,
        class_id: classId || null,
        teacher_id: user.id,
        file_type: fileType || null,
        file_url: fileUrl.trim() || null,
      });

      if (error) throw error;

      toast.success("Ressource ajoutée avec succès");
      resetForm();
      setOpen(false);
      onResourceAdded();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast.error("Erreur lors de l'ajout de la ressource");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubjectId("");
    setClassId("");
    setFileType("");
    setFileUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ressource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle ressource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="res-title">Titre *</Label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la ressource"
            />
          </div>

          <div>
            <Label htmlFor="res-desc">Description</Label>
            <Textarea
              id="res-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la ressource"
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

          <div>
            <Label>Type de fichier</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">Document</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="res-url">Lien du fichier</Label>
            <Input
              id="res-url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Ajouter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
