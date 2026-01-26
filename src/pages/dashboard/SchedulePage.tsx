import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Plus,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  Trash2,
  Edit
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Class {
  id: string;
  name: string;
}

interface SchoolYear {
  id: string;
  name: string;
  is_active: boolean;
}

interface Assignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  school_year_id: string;
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
}

interface ScheduleSlot {
  id: string;
  assignment_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  assignment?: Assignment;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function SchedulePage() {
  const { role, user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");

  // Form states
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClassForm, setSelectedClassForm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [room, setRoom] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSchoolYear) {
      fetchAssignments();
      fetchScheduleSlots();
    }
  }, [selectedSchoolYear, selectedClass]);

  const fetchData = async () => {
    try {
      // Fetch school years
      const { data: yearsData } = await supabase
        .from("school_years")
        .select("*")
        .order("start_date", { ascending: false });
      
      setSchoolYears(yearsData || []);
      const activeYear = yearsData?.find(y => y.is_active);
      if (activeYear) {
        setSelectedSchoolYear(activeYear.id);
      } else if (yearsData && yearsData.length > 0) {
        setSelectedSchoolYear(yearsData[0].id);
      }

      // Fetch teachers (users with teacher role)
      const { data: teacherRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher");

      if (teacherRoles && teacherRoles.length > 0) {
        const teacherIds = teacherRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", teacherIds);
        
        setTeachers(profiles?.map(p => ({
          id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name
        })) || []);
      }

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name, color");
      setSubjects(subjectsData || []);

      // Fetch classes
      const { data: classesData } = await supabase
        .from("classes")
        .select("id, name");
      setClasses(classesData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!selectedSchoolYear) return;

    let query = supabase
      .from("teacher_assignments")
      .select("*")
      .eq("school_year_id", selectedSchoolYear);

    if (selectedClass !== "all") {
      query = query.eq("class_id", selectedClass);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching assignments:", error);
      return;
    }

    // Enrich with related data
    const enrichedAssignments = await Promise.all(
      (data || []).map(async (assignment) => {
        const teacher = teachers.find(t => t.id === assignment.teacher_id);
        const subject = subjects.find(s => s.id === assignment.subject_id);
        const cls = classes.find(c => c.id === assignment.class_id);
        return {
          ...assignment,
          teacher,
          subject,
          class: cls
        };
      })
    );

    setAssignments(enrichedAssignments);
  };

  const fetchScheduleSlots = async () => {
    const { data, error } = await supabase
      .from("schedule_slots")
      .select(`
        *,
        assignment:teacher_assignments(
          id,
          teacher_id,
          subject_id,
          class_id
        )
      `);

    if (error) {
      console.error("Error fetching schedule slots:", error);
      return;
    }

    // Enrich with related data
    const enrichedSlots = (data || []).map(slot => {
      const assignment = assignments.find(a => a.id === slot.assignment_id);
      return {
        ...slot,
        assignment
      };
    });

    setScheduleSlots(enrichedSlots);
  };

  const handleCreateAssignment = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedClassForm || !selectedSchoolYear) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const { error } = await supabase.from("teacher_assignments").insert({
        teacher_id: selectedTeacher,
        subject_id: selectedSubject,
        class_id: selectedClassForm,
        school_year_id: selectedSchoolYear
      });

      if (error) throw error;

      toast.success("Affectation créée avec succès");
      setIsAssignmentDialogOpen(false);
      setSelectedTeacher("");
      setSelectedSubject("");
      setSelectedClassForm("");
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Erreur lors de la création de l'affectation");
    }
  };

  const handleCreateSlot = async () => {
    if (!selectedAssignment || !startTime || !endTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase.from("schedule_slots").insert({
        assignment_id: selectedAssignment,
        day_of_week: selectedDay,
        start_time: startTime,
        end_time: endTime,
        room: room || null
      });

      if (error) throw error;

      toast.success("Créneau ajouté avec succès");
      setIsSlotDialogOpen(false);
      setSelectedAssignment("");
      setStartTime("08:00");
      setEndTime("09:00");
      setRoom("");
      fetchScheduleSlots();
    } catch (error) {
      console.error("Error creating slot:", error);
      toast.error("Erreur lors de la création du créneau");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette affectation ?")) return;

    try {
      const { error } = await supabase
        .from("teacher_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Affectation supprimée");
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) return;

    try {
      const { error } = await supabase
        .from("schedule_slots")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Créneau supprimé");
      fetchScheduleSlots();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getSlotForDayAndTime = (day: number, time: string) => {
    return scheduleSlots.filter(slot => {
      if (slot.day_of_week !== day) return false;
      const slotStart = slot.start_time.slice(0, 5);
      return slotStart === time;
    });
  };

  const filteredSlots = selectedClass === "all" 
    ? scheduleSlots 
    : scheduleSlots.filter(slot => {
        const assignment = assignments.find(a => a.id === slot.assignment_id);
        return assignment?.class_id === selectedClass;
      });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const effectiveRole = role || "student";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role={effectiveRole} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Emplois du temps
            </h1>
            <p className="text-muted-foreground">
              Gérez les affectations et créneaux horaires
            </p>
          </div>
          
          {role === "admin" && (
            <div className="flex gap-2">
              <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Nouvelle affectation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une affectation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Enseignant</Label>
                      <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un enseignant" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.first_name} {teacher.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Matière</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: subject.color }}
                                />
                                {subject.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Classe</Label>
                      <Select value={selectedClassForm} onValueChange={setSelectedClassForm}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une classe" />
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
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateAssignment}>
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau créneau
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un créneau</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Affectation (Enseignant - Matière - Classe)</Label>
                      <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une affectation" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignments.map(assignment => (
                            <SelectItem key={assignment.id} value={assignment.id}>
                              {assignment.teacher?.first_name} {assignment.teacher?.last_name} - {assignment.subject?.name} - {assignment.class?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Jour</Label>
                      <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label>Salle (optionnel)</Label>
                      <Input 
                        placeholder="Ex: Salle 101"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsSlotDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateSlot}>
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Année scolaire" />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map(year => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.is_active && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <GraduationCap className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Users className="h-4 w-4 mr-2" />
              Affectations ({assignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            {/* Weekly Calendar View */}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-7 border-b">
                    <div className="p-3 border-r bg-muted/50 font-medium text-sm">
                      Horaires
                    </div>
                    {DAYS.map((day, index) => (
                      <div key={day} className="p-3 border-r last:border-r-0 bg-muted/50 font-medium text-sm text-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {TIME_SLOTS.map((time, timeIndex) => (
                    <div key={time} className="grid grid-cols-7 border-b last:border-b-0">
                      <div className="p-3 border-r bg-muted/30 text-sm font-medium">
                        {time}
                      </div>
                      {DAYS.map((_, dayIndex) => {
                        const slotsForCell = filteredSlots.filter(slot => {
                          if (slot.day_of_week !== dayIndex) return false;
                          const slotStart = slot.start_time.slice(0, 5);
                          return slotStart === time;
                        });

                        return (
                          <div key={dayIndex} className="p-1 border-r last:border-r-0 min-h-[60px]">
                            {slotsForCell.map((slot) => {
                              const assignment = assignments.find(a => a.id === slot.assignment_id);
                              const subject = subjects.find(s => s.id === assignment?.subject_id);
                              const teacher = teachers.find(t => t.id === assignment?.teacher_id);
                              const cls = classes.find(c => c.id === assignment?.class_id);

                              return (
                                <motion.div
                                  key={slot.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="p-2 rounded-lg text-xs group relative cursor-pointer"
                                  style={{ 
                                    backgroundColor: (subject?.color || "#3B82F6") + "20",
                                    borderLeft: `3px solid ${subject?.color || "#3B82F6"}`
                                  }}
                                >
                                  <div className="font-semibold" style={{ color: subject?.color }}>
                                    {subject?.name}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {teacher?.first_name} {teacher?.last_name}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {cls?.name} {slot.room && `• ${slot.room}`}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                  </div>
                                  {role === "admin" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleDeleteSlot(slot.id)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            {/* Assignments List */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Aucune affectation</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer des affectations enseignant-matière-classe
                </p>
                {role === "admin" && (
                  <Button onClick={() => setIsAssignmentDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une affectation
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/30 transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: (assignment.subject?.color || "#3B82F6") + "20" }}
                            >
                              <BookOpen 
                                className="h-5 w-5" 
                                style={{ color: assignment.subject?.color || "#3B82F6" }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold">{assignment.subject?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.teacher?.first_name} {assignment.teacher?.last_name}
                              </div>
                            </div>
                          </div>
                          {role === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {assignment.class?.name}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}