import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Video,
  Calendar,
  Clock,
  FileText,
  BookMarked,
  Award,
  ArrowRight,
  Play,
  Bell,
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
  subject: string;
  subjectColor: string;
  teacher: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StudentInfo {
  firstName: string;
  lastName: string;
  className: string | null;
  levelName: string | null;
  selectedPlan: string | null;
}

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const { t, language } = useLanguage();
  const dateLocale = language === 'ar' ? arSA : frLocale;
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: '',
    lastName: '',
    className: null,
    levelName: null,
    selectedPlan: null,
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, selected_plan')
        .eq('user_id', user.id)
        .single();

      let studentId = user.id;
      let studentProfile = profileData;

      const { data: enrollmentData } = await supabase
        .from('student_enrollments')
        .select(`
          classes!inner (
            name,
            levels!inner (name)
          )
        `)
        .eq('student_id', studentId)
        .limit(1)
        .single();

      setStudentInfo({
        firstName: studentProfile?.first_name || '',
        lastName: studentProfile?.last_name || '',
        className: (enrollmentData?.classes as any)?.name || null,
        levelName: (enrollmentData?.classes as any)?.levels?.name || null,
        selectedPlan: studentProfile?.selected_plan || null,
      });

      if (enrollmentData) {
        const dayOfWeek = new Date().getDay();
        const classId = (enrollmentData.classes as any)?.id;

        if (classId) {
          const { data: scheduleData } = await supabase
            .from('schedule_slots')
            .select(`
              id,
              start_time,
              end_time,
              day_of_week,
              teacher_assignments!inner (
                class_id,
                subjects!inner (name, color),
                profiles!inner (first_name, last_name)
              )
            `)
            .eq('day_of_week', dayOfWeek)
            .eq('teacher_assignments.class_id', classId)
            .order('start_time', { ascending: true });

          const now = new Date();
          const currentTime = format(now, 'HH:mm:ss');

          const transformedSchedule: ScheduleItem[] = (scheduleData || []).map((slot: any) => {
            let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
            if (slot.end_time < currentTime) {
              status = 'completed';
            } else if (slot.start_time <= currentTime && slot.end_time >= currentTime) {
              status = 'current';
            }

            return {
              id: slot.id,
              time: slot.start_time?.slice(0, 5) || '',
              subject: slot.teacher_assignments?.subjects?.name || '',
              subjectColor: slot.teacher_assignments?.subjects?.color || '#3B82F6',
              teacher: `${slot.teacher_assignments?.profiles?.first_name || ''} ${slot.teacher_assignments?.profiles?.last_name || ''}`.trim(),
              status,
            };
          });

          setSchedule(transformedSchedule);
        }
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentClass = schedule.find(s => s.status === 'current');
  const nextClass = schedule.find(s => s.status === 'upcoming');
  const highlightedClass = currentClass || nextClass;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
        <DashboardSidebar role="student" />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{t("student.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role="student" />
      
      <main className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              {t("student.hello").replace('{name}', studentInfo.firstName || (language === 'ar' ? 'تلميذ' : 'Élève'))}
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {studentInfo.className && studentInfo.levelName 
                ? `${studentInfo.levelName} - ${studentInfo.className}`
                : format(new Date(), "EEEE d MMMM yyyy", { locale: dateLocale })
              }
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9 lg:h-10 lg:w-10">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>

        {/* Current/Next class */}
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
                    <span className="text-xs lg:text-sm font-medium text-accent">{t("student.currentCourse")}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-primary" />
                    <span className="text-xs lg:text-sm font-medium text-primary">{t("student.nextCourse")}</span>
                  </>
                )}
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">{highlightedClass.time}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
              <div 
                className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: highlightedClass.subjectColor + '20' }}
              >
                <BookMarked 
                  className="h-6 w-6 lg:h-8 lg:w-8" 
                  style={{ color: highlightedClass.subjectColor }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg lg:text-xl font-bold mb-1 text-foreground">{highlightedClass.subject}</h2>
                <p className="text-sm lg:text-base text-muted-foreground">{highlightedClass.teacher}</p>
              </div>
              <Button variant="default" size="sm" className="w-full sm:w-auto lg:size-lg">
                <Play className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                {t("student.joinCourse")}
              </Button>
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
            <h2 className="text-lg lg:text-xl font-semibold mb-2 text-foreground">{t("student.noCourseToday")}</h2>
            <p className="text-sm lg:text-base text-muted-foreground">{t("student.enjoyDay")}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Today's schedule */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-4 lg:p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">{t("student.todayCourses")}</h2>
                  <Button variant="ghost" size="sm" asChild className="text-xs lg:text-sm">
                    <Link to="/dashboard/schedule">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">{t("student.schedule")}</span>
                      <span className="sm:hidden">{t("student.edt")}</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-4 lg:p-6">
                {schedule.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 text-muted-foreground">
                    <Clock className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                    <p className="text-sm lg:text-base">{t("student.noCourseScheduled")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:flex gap-2 lg:gap-3">
                    {schedule.map((cls, index) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex-1 p-3 lg:p-4 rounded-xl text-center transition-all ${
                          cls.status === 'current' 
                            ? 'bg-accent text-accent-foreground shadow-lg' 
                            : cls.status === 'completed'
                              ? 'bg-muted/50 opacity-60'
                              : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 lg:mb-2">{cls.time}</div>
                        <div className="font-semibold text-sm lg:text-base mb-1 truncate">{cls.subject}</div>
                        <div className={`text-xs truncate ${cls.status === 'current' ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                          {cls.teacher}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-4 lg:p-6 border-b border-border">
                <h2 className="text-base lg:text-lg font-semibold text-foreground">{t("student.quickAccess")}</h2>
              </div>
              <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <Link
                  to="/dashboard/homework"
                  className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm lg:text-base text-foreground">{t("student.homework")}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">{t("student.viewHomework")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground hidden sm:block" />
                </Link>
                <Link
                  to="/dashboard/resources"
                  className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookMarked className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm lg:text-base text-foreground">{t("student.resources")}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">{t("student.courseDocuments")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground hidden sm:block" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 lg:space-y-6">
            {/* Grades placeholder */}
            <div className="bg-card rounded-xl p-4 lg:p-6 shadow-card border border-border">
              <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 lg:h-7 lg:w-7 text-accent" />
                </div>
                <div>
                  <div className="text-xs lg:text-sm text-muted-foreground">{t("student.generalAverage")}</div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">--<span className="text-base lg:text-lg text-muted-foreground">/20</span></div>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {t("student.gradesWillShow")}
              </p>
            </div>

            {/* Sessions/Videos */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-3 lg:p-4 border-b border-border">
                <h3 className="font-semibold text-sm lg:text-base text-foreground">{t("student.onlineCourses")}</h3>
              </div>
              <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
                <Link
                  to="/dashboard/sessions"
                  className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Video className="h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm font-medium text-foreground">{t("student.myCourses")}</div>
                    <div className="text-xs text-muted-foreground">{t("student.accessSessions")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-card rounded-xl p-3 lg:p-4 shadow-card border border-border">
              <Link to="/dashboard/messages" className="flex items-center gap-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm lg:text-base text-foreground">{t("student.messages")}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">{t("student.communications")}</div>
                </div>
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
