import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Video,
  Calendar,
  Clock,
  Users,
  FileText,
  BookMarked,
  CheckCircle2,
  ArrowRight,
  Play,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr as frLocale, arSA } from "date-fns/locale";
import { useLanguage } from "@/hooks/useLanguage";

interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  subject: string;
  subjectColor: string;
  className: string;
  room: string | null;
  status: 'completed' | 'current' | 'upcoming';
  forceCompleted?: boolean;
}

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  todaySessions: number;
  weekSessions: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const dateLocale = language === 'ar' ? arSA : frLocale;
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalClasses: 0,
    todaySessions: 0,
    weekSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  // Re-evaluate session statuses every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper: convert "HH:mm" or "HH:mm:ss" to minutes since midnight
  const toMinutes = (timeStr: string | null | undefined): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    return h * 60 + m;
  };

  // Recompute statuses based on nowTick
  const scheduleWithStatus = schedule.map(item => {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startMin = toMinutes(item.time);
    const endMin = toMinutes(item.endTime);
    let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (item.forceCompleted) status = 'completed';
    else if (endMin > 0 && currentMin >= endMin) status = 'completed';
    else if (currentMin >= startMin && currentMin < endMin) status = 'current';
    return { ...item, status };
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _tickDep = nowTick;

  const fetchTeacherData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: assignmentsData } = await supabase
        .from('teacher_assignments')
        .select(`
          id,
          class_id,
          subjects!inner (name, color),
          classes!inner (name, id)
        `)
        .eq('teacher_id', user.id);

      const uniqueClasses = new Set(assignmentsData?.map(a => a.class_id) || []);
      
      let totalStudents = 0;
      if (assignmentsData && assignmentsData.length > 0) {
        const classIds = [...uniqueClasses];
        const { count } = await supabase
          .from('student_enrollments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
        totalStudents = count || 0;
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const dayOfWeek = new Date().getDay();

      const { data: scheduleData } = await supabase
        .from('schedule_slots')
        .select(`
          id,
          start_time,
          end_time,
          room,
          day_of_week,
          teacher_assignments!inner (
            teacher_id,
            subjects!inner (name, color),
            classes!inner (name)
          )
        `)
        .eq('day_of_week', dayOfWeek)
        .eq('teacher_assignments.teacher_id', user.id)
        .order('start_time', { ascending: true });

      const { data: directSessions } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          start_time,
          end_time,
          status,
          google_meet_link,
          is_direct,
          subject:subjects(name, color),
          class:classes(name)
        `)
        .eq('session_date', today)
        .eq('teacher_id', user.id)
        .eq('is_direct', true);

      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');

      const transformedSchedule: ScheduleItem[] = (scheduleData || []).map((slot: any) => {
        return {
          id: slot.id,
          time: slot.start_time?.slice(0, 5) || '',
          endTime: slot.end_time?.slice(0, 5) || '',
          subject: slot.teacher_assignments?.subjects?.name || '',
          subjectColor: slot.teacher_assignments?.subjects?.color || '#3B82F6',
          className: slot.teacher_assignments?.classes?.name || '',
          room: slot.room,
          status: 'upcoming',
        };
      });

      const directScheduleItems: ScheduleItem[] = (directSessions || []).map((session: any) => {
        const startTime = session.start_time || '00:00:00';
        const endTime = session.end_time || '23:59:00';
        return {
          id: session.id,
          time: startTime?.slice(0, 5) || '',
          endTime: endTime?.slice(0, 5) || '',
          subject: session.subject?.name || session.title || '',
          subjectColor: session.subject?.color || '#F59E0B',
          className: session.class?.name || '',
          room: null,
          status: 'upcoming',
          forceCompleted: session.status === 'completed',
        };
      });

      const allItems = [...transformedSchedule, ...directScheduleItems].sort(
        (a, b) => a.time.localeCompare(b.time)
      );

      setSchedule(allItems);
      setStats({
        totalStudents,
        totalClasses: uniqueClasses.size,
        todaySessions: allItems.length,
        weekSessions: (assignmentsData?.length || 0) * 5,
      });

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentClass = scheduleWithStatus.find(s => s.status === 'current');
  const nextClass = scheduleWithStatus.find(s => s.status === 'upcoming');
  const highlightedClass = currentClass || nextClass;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
        <DashboardSidebar role="teacher" />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{t("teacher.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role="teacher" />
      
      <main className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            {t("teacher.hello").replace('{name}', profile?.first_name || (language === 'ar' ? 'أستاذ' : 'Enseignant'))}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        {/* Current/Next class highlight */}
        {highlightedClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-card border mb-6 lg:mb-8 ${
              currentClass ? 'border-accent' : 'border-primary'
            }`}
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="flex items-center gap-2">
                {currentClass ? (
                  <>
                    <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs lg:text-sm font-medium text-accent">{t("teacher.currentCourse")}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-primary" />
                    <span className="text-xs lg:text-sm font-medium text-primary">{t("teacher.nextCourse")}</span>
                  </>
                )}
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">
                {highlightedClass.time} - {highlightedClass.endTime}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
              <div 
                className="h-14 w-14 lg:h-20 lg:w-20 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: highlightedClass.subjectColor + '20' }}
              >
                <BookMarked 
                  className="h-7 w-7 lg:h-10 lg:w-10" 
                  style={{ color: highlightedClass.subjectColor }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg lg:text-2xl font-bold mb-1 text-foreground">{highlightedClass.subject}</h2>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {highlightedClass.className} {highlightedClass.room && `• ${highlightedClass.room}`}
                </p>
              </div>
              <div className="flex gap-2 lg:gap-3 w-full sm:w-auto">
                <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial lg:size-lg">
                  <Link to="/dashboard/attendance">
                    <Users className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">{t("teacher.attendances")}</span>
                  </Link>
                </Button>
                <Button variant="default" size="sm" className="flex-1 sm:flex-initial lg:size-lg">
                  <Play className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  <span>{t("teacher.join")}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {!highlightedClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-card border border-border mb-6 lg:mb-8 text-center"
          >
            <Calendar className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-muted-foreground" />
            <h2 className="text-lg lg:text-xl font-semibold mb-2 text-foreground">{t("teacher.noCourseToday")}</h2>
            <p className="text-sm lg:text-base text-muted-foreground">{t("teacher.enjoyDay")}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Today's schedule */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-foreground">{t("teacher.todaySchedule")}</h2>
                <Button variant="ghost" size="sm" asChild className="text-xs lg:text-sm">
                  <Link to="/dashboard/schedule">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">{t("teacher.viewWeek")}</span>
                    <span className="sm:hidden">{t("teacher.week")}</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-4 lg:p-6 space-y-2 lg:space-y-3">
              {scheduleWithStatus.length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                  <p className="text-sm lg:text-base">{t("teacher.noCourseScheduled")}</p>
                </div>
              ) : (
                scheduleWithStatus.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl transition-colors ${
                      item.status === 'current' 
                        ? 'bg-accent/10 border border-accent' 
                        : item.status === 'completed'
                          ? 'bg-muted/50 opacity-60'
                          : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div 
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: item.status === 'current' 
                          ? 'hsl(var(--accent))' 
                          : item.status === 'completed' 
                            ? 'hsl(var(--muted-foreground))' 
                            : item.subjectColor 
                      }}
                    />
                    <div className="w-20 lg:w-32 text-xs lg:text-sm font-medium text-foreground">
                      {item.time} - {item.endTime}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm lg:text-base text-foreground truncate">{item.subject}</div>
                      <div className="text-xs lg:text-sm text-muted-foreground truncate">{item.className}</div>
                    </div>
                    {item.status === 'current' ? (
                      <Button size="sm" variant="default" className="hidden sm:flex">
                        <Video className="h-4 w-4 mr-1" />
                        {t("teacher.ongoing")}
                      </Button>
                    ) : item.status === 'completed' ? (
                      <div className="hidden sm:flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden lg:inline">{t("teacher.completed")}</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="hidden sm:flex">
                        <span className="hidden lg:inline">{t("teacher.prepare")}</span>
                        <span className="lg:hidden">{t("teacher.prep")}</span>
                      </Button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 lg:space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="bg-card rounded-xl p-3 lg:p-4 shadow-card border border-border">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 lg:mb-3">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">{t("teacher.totalStudents")}</div>
              </div>
              <div className="bg-card rounded-xl p-3 lg:p-4 shadow-card border border-border">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2 lg:mb-3">
                  <BookMarked className="h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-foreground">{stats.totalClasses}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">{t("teacher.classes")}</div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-3 lg:p-4 border-b border-border">
                <h3 className="font-semibold text-sm lg:text-base text-foreground">{t("teacher.quickActions")}</h3>
              </div>
              <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
                <Link
                  to="/dashboard/resources"
                  className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm font-medium text-foreground">{t("teacher.courseResources")}</div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{t("teacher.manageDocuments")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/dashboard/evaluations"
                  className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm font-medium text-foreground">{t("teacher.homeworkExams")}</div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{t("teacher.createEvaluation")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/dashboard/attendance"
                  className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm font-medium text-foreground">{t("teacher.attendances")}</div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{t("teacher.manageAttendances")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Week overview */}
            <div className="bg-card rounded-xl shadow-card border border-border p-3 lg:p-4">
              <div className="flex items-center gap-3 mb-3 lg:mb-4">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm lg:text-base text-foreground">{t("teacher.thisWeek")}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">
                    {stats.todaySessions} {t("teacher.coursesToday")}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs lg:text-sm" asChild>
                <Link to="/dashboard/schedule">
                  {t("teacher.viewFullSchedule")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
