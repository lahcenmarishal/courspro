import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Clock, 
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Attendance {
  id: string;
  is_present: boolean;
  joined_at: string | null;
  left_at: string | null;
  session: {
    session_date: string;
    schedule_slot: {
      start_time: string;
      end_time: string;
      assignment: {
        subject: { name: string; color: string } | null;
        class: { name: string } | null;
      } | null;
    } | null;
  } | null;
}

export default function AttendancePage() {
  const { role, user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    if (role === "teacher") {
      fetchClasses();
    } else {
      fetchAttendance(user?.id);
    }
  }, [user, role]);

  const fetchClasses = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("teacher_assignments")
      .select("class:classes(id, name)")
      .eq("teacher_id", user.id);

    const classMap = new Map<string, { id: string; name: string }>();
    data?.forEach(d => {
      if (d.class?.id && d.class?.name) {
        classMap.set(d.class.id, { id: d.class.id, name: d.class.name });
      }
    });
    const uniqueClasses = Array.from(classMap.values());

    setClasses(uniqueClasses);
    setLoading(false);
  };

  const fetchAttendance = async (studentId?: string) => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("attendances")
        .select(`
          id,
          is_present,
          joined_at,
          left_at,
          session:sessions(
            session_date,
            schedule_slot:schedule_slots(
              start_time,
              end_time,
              assignment:teacher_assignments(
                subject:subjects(name, color),
                class:classes(name)
              )
            )
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttendances(data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Erreur lors du chargement des présences");
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendances.filter(a => a.is_present).length;
  const absentCount = attendances.filter(a => !a.is_present).length;
  const attendanceRate = attendances.length > 0 
    ? (presentCount / attendances.length) * 100 
    : 100;

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getAttendanceForDay = (day: Date) => {
    return attendances.filter(a => 
      a.session?.session_date && 
      isSameDay(new Date(a.session.session_date), day)
    );
  };

  const getDayStatus = (day: Date) => {
    const dayAttendances = getAttendanceForDay(day);
    if (dayAttendances.length === 0) return null;
    if (dayAttendances.every(a => a.is_present)) return "present";
    if (dayAttendances.every(a => !a.is_present)) return "absent";
    return "partial";
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  if (!role) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role={role} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {role === "teacher" ? "Gestion des présences" : "Présences"}
            </h1>
            <p className="text-muted-foreground">
              {role === "teacher" 
                ? "Gérez les présences de vos élèves" 
                : "Consultez votre historique de présences"}
            </p>
          </div>
        </div>

        {role === "teacher" && classes.length > 0 && (
          <div className="mb-6">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sélectionner une classe" />
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
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{attendances.length}</div>
                  <div className="text-sm text-muted-foreground">Total séances</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{presentCount}</div>
                  <div className="text-sm text-muted-foreground">Présences</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{absentCount}</div>
                  <div className="text-sm text-muted-foreground">Absences</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">%</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">{attendanceRate.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Taux de présence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Calendrier</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-32 text-center">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {daysInMonth.map(day => {
                  const status = getDayStatus(day);
                  return (
                    <motion.div
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-sm cursor-pointer
                        transition-colors hover:bg-muted
                        ${status === "present" ? "bg-green-500/20 text-green-600 font-medium" : ""}
                        ${status === "absent" ? "bg-destructive/20 text-destructive font-medium" : ""}
                        ${status === "partial" ? "bg-orange-500/20 text-orange-600 font-medium" : ""}
                        ${!status ? "text-muted-foreground" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  <span>Présent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-destructive/50" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-orange-500/50" />
                  <span>Partiel</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique récent</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-2 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : attendances.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Aucune présence enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendances.slice(0, 10).map((attendance, index) => (
                    <motion.div
                      key={attendance.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {attendance.is_present ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {attendance.session?.schedule_slot?.assignment?.subject?.name || "Cours"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attendance.session?.session_date && 
                            format(new Date(attendance.session.session_date), "d MMM yyyy", { locale: fr })}
                          {attendance.session?.schedule_slot && 
                            ` • ${attendance.session.schedule_slot.start_time.slice(0, 5)} - ${attendance.session.schedule_slot.end_time.slice(0, 5)}`}
                        </div>
                      </div>

                      <Badge 
                        variant={attendance.is_present ? "secondary" : "destructive"}
                        className={attendance.is_present ? "bg-green-500/10 text-green-600" : ""}
                      >
                        {attendance.is_present ? "Présent" : "Absent"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}