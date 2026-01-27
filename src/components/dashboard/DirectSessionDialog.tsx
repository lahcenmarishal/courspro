import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Zap } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Class {
  id: string;
  name: string;
}

interface DirectSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userRole: "admin" | "teacher";
  onSessionCreated: () => void;
}

export function DirectSessionDialog({
  open,
  onOpenChange,
  userId,
  userRole,
  onSessionCreated,
}: DirectSessionDialogProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name, color");
      setSubjects(subjectsData || []);

      // Fetch classes based on role
      if (userRole === "admin") {
        const { data: classesData } = await supabase
          .from("classes")
          .select("id, name");
        setClasses(classesData || []);
      } else {
        // For teachers, only show their assigned classes
        const { data: assignmentsData } = await supabase
          .from("teacher_assignments")
          .select("class_id, classes(id, name)")
          .eq("teacher_id", userId);

        const uniqueClasses = new Map();
        assignmentsData?.forEach((a: any) => {
          if (a.classes && !uniqueClasses.has(a.classes.id)) {
            uniqueClasses.set(a.classes.id, a.classes);
          }
        });
        setClasses(Array.from(uniqueClasses.values()));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateJitsiLink = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    
    const subject = subjects.find(s => s.id === selectedSubject);
    const cls = classes.find(c => c.id === selectedClass);
    
    const subjectName = subject?.name?.replace(/\s+/g, '') || 'Direct';
    const className = cls?.name?.replace(/\s+/g, '') || '';
    
    const roomName = `CoursPro-${subjectName}-${className}-${timestamp}${randomPart}`;
    const link = `https://meet.jit.si/${roomName}`;
    setMeetLink(link);
    toast.success("Lien Jitsi Meet généré!");
  };

  const handleCreateDirectSession = async () => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre pour la séance");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Veuillez spécifier les horaires");
      return;
    }

    setLoading(true);

    try {
      // Generate meet link if not provided
      let finalMeetLink = meetLink;
      if (!finalMeetLink) {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        const roomName = `CoursPro-Direct-${timestamp}${randomPart}`;
        finalMeetLink = `https://meet.jit.si/${roomName}`;
      }

      const { error } = await supabase.from("sessions").insert({
        title,
        subject_id: selectedSubject || null,
        class_id: selectedClass || null,
        teacher_id: userId,
        is_direct: true,
        session_date: new Date().toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        google_meet_link: finalMeetLink,
        notes: notes || null,
        status: "in_progress",
      });

      if (error) throw error;

      toast.success("Séance directe créée avec succès!");
      resetForm();
      onOpenChange(false);
      onSessionCreated();
    } catch (error) {
      console.error("Error creating direct session:", error);
      toast.error("Erreur lors de la création de la séance");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedSubject("");
    setSelectedClass("");
    setStartTime("09:00");
    setEndTime("10:00");
    setMeetLink("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Lancer une séance directe
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Une séance directe vous permet de démarrer un cours instantanément, 
              sans dépendre de l'emploi du temps ou des créneaux.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Titre de la séance *</Label>
            <Input
              placeholder="Ex: Révision chapitre 5, Cours de rattrapage..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière (optionnel)</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Classe (optionnel)</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lien Jitsi Meet</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://meet.jit.si/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateJitsiLink}
                title="Générer un lien"
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Un lien sera généré automatiquement si laissé vide
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Notes pour cette séance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleCreateDirectSession} disabled={loading}>
              <Zap className="h-4 w-4 mr-2" />
              {loading ? "Création..." : "Lancer la séance"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}