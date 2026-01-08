import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  Video,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Plus,
  MoreVertical,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSessions: number;
}

interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  role?: string;
}

interface TodaySession {
  id: string;
  session_date: string;
  status: string;
  schedule_slot: {
    start_time: string;
    end_time: string;
    room: string | null;
    assignment: {
      subject: { name: string; color: string };
      class: { name: string };
      teacher: { first_name: string; last_name: string };
    };
  } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSessions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: studentsCount },
        { count: teachersCount },
        { count: classesCount },
        { count: sessionsCount },
        { data: recentUsersData },
        { data: sessionsData }
      ] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('sessions')
          .select(`
            id,
            session_date,
            status,
            schedule_slots!inner (
              start_time,
              end_time,
              room,
              teacher_assignments!inner (
                subjects!inner (name, color),
                classes!inner (name),
                profiles!inner (first_name, last_name)
              )
            )
          `)
          .eq('session_date', format(new Date(), 'yyyy-MM-dd'))
          .order('session_date', { ascending: true })
          .limit(5)
      ]);

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalClasses: classesCount || 0,
        totalSessions: sessionsCount || 0,
      });

      if (recentUsersData) {
        const usersWithRoles = await Promise.all(
          recentUsersData.map(async (user) => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.user_id)
              .single();
            return { ...user, role: roleData?.role };
          })
        );
        setRecentUsers(usersWithRoles);
      }

      if (sessionsData) {
        const transformedSessions = sessionsData.map((session: any) => ({
          id: session.id,
          session_date: session.session_date,
          status: session.status,
          schedule_slot: session.schedule_slots ? {
            start_time: session.schedule_slots.start_time,
            end_time: session.schedule_slots.end_time,
            room: session.schedule_slots.room,
            assignment: {
              subject: session.schedule_slots.teacher_assignments?.subjects,
              class: session.schedule_slots.teacher_assignments?.classes,
              teacher: session.schedule_slots.teacher_assignments?.profiles,
            }
          } : null
        }));
        setTodaySessions(transformedSessions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'teacher': return 'Enseignant';
      case 'student': return 'Élève';
      case 'parent': return 'Parent';
      default: return 'Utilisateur';
    }
  };

  const statCards = [
    { 
      label: "Total élèves", 
      value: stats.totalStudents.toString(),
      icon: Users,
      color: "primary",
      href: "/dashboard/users"
    },
    { 
      label: "Enseignants", 
      value: stats.totalTeachers.toString(),
      icon: BookOpen,
      color: "accent",
      href: "/dashboard/users"
    },
    { 
      label: "Classes actives", 
      value: stats.totalClasses.toString(),
      icon: GraduationCap,
      color: "secondary",
      href: "/dashboard/classes"
    },
    { 
      label: "Séances totales", 
      value: stats.totalSessions.toString(),
      icon: Video,
      color: "primary",
      href: "/dashboard/sessions"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
        <DashboardSidebar role="admin" />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role="admin" />
      
      <main className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 w-full sm:w-48 lg:w-64 bg-card"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 lg:h-10 lg:w-10">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 hidden sm:flex">
              <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={stat.href}
                className="block bg-card rounded-xl p-4 lg:p-6 shadow-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary/10' :
                    stat.color === 'accent' ? 'bg-accent/10' : 'bg-secondary/10'
                  }`}>
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${
                      stat.color === 'primary' ? 'text-primary' :
                      stat.color === 'accent' ? 'text-accent' : 'text-secondary'
                    }`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">{stat.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Today's sessions */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Cours du jour</h2>
                <Button variant="outline" size="sm" asChild className="text-xs lg:text-sm">
                  <Link to="/dashboard/sessions">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Voir tout</span>
                    <span className="sm:hidden">Tout</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              {todaySessions.length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                  <Video className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                  <p className="text-sm lg:text-base">Aucun cours prévu aujourd'hui</p>
                </div>
              ) : (
                todaySessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div 
                      className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: session.schedule_slot?.assignment?.subject?.color + '20' }}
                    >
                      <Video 
                        className="h-5 w-5 lg:h-6 lg:w-6" 
                        style={{ color: session.schedule_slot?.assignment?.subject?.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm lg:text-base text-foreground truncate">
                        {session.schedule_slot?.assignment?.subject?.name || 'Matière inconnue'}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground truncate">
                        {session.schedule_slot?.assignment?.class?.name} • {session.schedule_slot?.assignment?.teacher?.first_name} {session.schedule_slot?.assignment?.teacher?.last_name}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                        <span className="text-xs lg:text-sm text-foreground">
                          {session.schedule_slot?.start_time?.slice(0, 5)}
                        </span>
                      </div>
                      {session.status === 'live' && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-medium">
                          <span className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-accent animate-pulse" />
                          En direct
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recent users */}
          <div className="bg-card rounded-xl shadow-card border border-border">
            <div className="p-4 lg:p-6 border-b border-border">
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Utilisateurs récents</h2>
            </div>
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                  <Users className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                  <p className="text-sm lg:text-base">Aucun utilisateur récent</p>
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs lg:text-sm font-semibold text-primary">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="text-xs text-accent">{getRoleLabel(user.role)}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Ajouter un élève", icon: Users, color: "primary", href: "/dashboard/users" },
            { label: "Créer une classe", icon: GraduationCap, color: "accent", href: "/dashboard/classes" },
            { label: "Planifier un cours", icon: Calendar, color: "secondary", href: "/dashboard/schedule" },
            { label: "Gérer les matières", icon: BookOpen, color: "primary", href: "/dashboard/subjects" },
          ].map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link
                to={action.href}
                className="flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:-translate-y-1 shadow-card"
              >
                <div className={`h-8 w-8 lg:h-10 lg:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  action.color === 'primary' ? 'bg-primary/10' :
                  action.color === 'accent' ? 'bg-accent/10' : 'bg-secondary/10'
                }`}>
                  <Plus className={`h-4 w-4 lg:h-5 lg:w-5 ${
                    action.color === 'primary' ? 'text-primary' :
                    action.color === 'accent' ? 'text-accent' : 'text-secondary'
                  }`} />
                </div>
                <span className="font-medium text-xs lg:text-sm text-foreground">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Educational Programs Overview */}
        <div className="mt-6 lg:mt-8">
          <h2 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6">Programmes éducatifs</h2>
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Primaire */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Primaire</h3>
                    <p className="text-sm opacity-90">6ème année primaire</p>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">100</span>
                  <span className="text-sm">MAD/mois</span>
                  <span className="text-xs opacity-70 ml-2">• 500 DH/an</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Construire des bases solides avec un accompagnement bienveillant
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-primary mb-2">Matières enseignées</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Arabe", icon: "📖", desc: "Grammaire, lecture, expression écrite et orale" },
                      { name: "Français", icon: "🇫🇷", desc: "Maîtrise de la langue française" },
                      { name: "Mathématiques", icon: "🔢", desc: "Calcul, géométrie et résolution de problèmes" }
                    ].map((subject) => (
                      <div key={subject.name} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md text-xs">
                        <span>{subject.icon}</span>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>3 séances / semaine • 3h / séance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Mini-groupes (max 8 élèves)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Collège */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Collège</h3>
                    <p className="text-sm opacity-90">3ème année collège</p>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">150</span>
                  <span className="text-sm">MAD/mois</span>
                  <span className="text-xs opacity-70 ml-2">• 700 DH/an</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Préparer l'excellence avec autonomie pour le brevet
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-emerald-600 mb-2">Matières enseignées</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Mathématiques", icon: "📐", desc: "Algèbre, géométrie et analyse" },
                      { name: "Français", icon: "📚", desc: "Langue et littérature" },
                      { name: "Physique-Chimie", icon: "🔬", desc: "Sciences expérimentales" },
                      { name: "SVT", icon: "🌿", desc: "Sciences de la vie et de la terre" },
                      { name: "Anglais", icon: "🇬🇧", desc: "Langue internationale" }
                    ].map((subject) => (
                      <div key={subject.name} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-md text-xs">
                        <span>{subject.icon}</span>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>5 séances / semaine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Mini-groupes (max 10 élèves)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>95% taux de réussite au Brevet</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lycée */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Lycée</h3>
                    <p className="text-sm opacity-90">1ère & 2ème année BAC</p>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">200-350</span>
                  <span className="text-sm">MAD/mois</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Objectif Baccalauréat avec préparation intensive
                </p>
                
                {/* Packs Lycée */}
                <div className="space-y-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600">Pack Jihawi (1ère BAC)</p>
                    <p className="text-xs text-muted-foreground">Français | Arabe | Éducation islamique | GEO</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">200 MAD/mois • 900 DH/an</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-xs font-semibold text-purple-600">Pack Essentiel (2ème BAC)</p>
                    <p className="text-xs text-muted-foreground">Math | Physique chimie | SVT</p>
                    <p className="text-xs text-purple-600 font-medium mt-1">250 MAD/mois • 1200 DH/an</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600">Pack Total Watani (2ème BAC) ⭐</p>
                    <p className="text-xs text-muted-foreground">Math | PC | SVT | Anglais | Philosophie</p>
                    <p className="text-xs text-amber-600 font-medium mt-1">350 MAD/mois • 1500 DH/an</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-amber-600 mb-2">Toutes les matières</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Math", icon: "📐" },
                      { name: "PC", icon: "⚛️" },
                      { name: "SVT", icon: "🧬" },
                      { name: "Philo", icon: "🎓" },
                      { name: "Anglais", icon: "🌍" },
                      { name: "Français", icon: "📖" }
                    ].map((subject) => (
                      <div key={subject.name} className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-md text-xs">
                        <span>{subject.icon}</span>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Jusqu'à 8h / semaine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>98% taux de réussite au BAC</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
