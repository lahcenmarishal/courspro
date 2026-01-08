import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  Bell,
  Loader2,
  GraduationCap,
  BarChart3,
  BookMarked
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  className: string | null;
  levelName: string | null;
}

interface ParentInfo {
  firstName: string;
  lastName: string;
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const [parentInfo, setParentInfo] = useState<ParentInfo>({
    firstName: '',
    lastName: '',
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    if (!user) return;

    try {
      // Fetch parent profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setParentInfo({
          firstName: profileData.first_name,
          lastName: profileData.last_name,
        });
      }

      // Fetch children
      const { data: childrenRelations } = await supabase
        .from('parent_student')
        .select('student_id')
        .eq('parent_id', user.id);

      if (childrenRelations && childrenRelations.length > 0) {
        const childrenData = await Promise.all(
          childrenRelations.map(async (relation) => {
            // Fetch child profile
            const { data: childProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', relation.student_id)
              .single();

            // Fetch child enrollment
            const { data: enrollment } = await supabase
              .from('student_enrollments')
              .select(`
                classes!inner (
                  name,
                  levels!inner (name)
                )
              `)
              .eq('student_id', relation.student_id)
              .limit(1)
              .single();

            return {
              id: relation.student_id,
              firstName: childProfile?.first_name || '',
              lastName: childProfile?.last_name || '',
              className: (enrollment?.classes as any)?.name || null,
              levelName: (enrollment?.classes as any)?.levels?.name || null,
            };
          })
        );

        setChildren(childrenData);
      }

    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex">
        <DashboardSidebar role="parent" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role="parent" />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {parentInfo.firstName || 'Parent'} 👋
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Children section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Mes enfants</h2>
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border text-center"
            >
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucun enfant associé</h3>
              <p className="text-muted-foreground">
                Contactez l'administration pour associer vos enfants à votre compte
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary">
                        {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {child.levelName && child.className 
                          ? `${child.levelName} - ${child.className}`
                          : 'Non inscrit'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to={`/dashboard/tracking?student=${child.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Suivi scolaire</span>
                    </Link>
                    <Link
                      to={`/dashboard/grades?student=${child.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <Award className="h-4 w-4 text-accent" />
                      <span>Notes</span>
                    </Link>
                    <Link
                      to={`/dashboard/attendance?student=${child.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <Clock className="h-4 w-4 text-secondary" />
                      <span>Présences</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Accès rapide</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              <Link
                to="/dashboard/tracking"
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Suivi scolaire</div>
                  <div className="text-sm text-muted-foreground">Progression et résultats</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              <Link
                to="/dashboard/attendance"
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Présences</div>
                  <div className="text-sm text-muted-foreground">Absences et retards</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              <Link
                to="/dashboard/grades"
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Notes</div>
                  <div className="text-sm text-muted-foreground">Bulletins et évaluations</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              <Link
                to="/dashboard/calendar"
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Calendrier</div>
                  <div className="text-sm text-muted-foreground">Événements et réunions</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Subscription info placeholder */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">Abonnement</div>
                  <div className="text-sm text-muted-foreground">État des paiements</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard/subscriptions">
                  Voir les détails
                </Link>
              </Button>
            </div>

            {/* Messages */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Communications</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  to="/dashboard/messages"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Messages</div>
                    <div className="text-xs text-muted-foreground">Contacter les enseignants</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-card rounded-xl p-4 shadow-card border border-border">
              <Link to="/dashboard/resources" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Ressources</div>
                  <div className="text-sm text-muted-foreground">Documents partagés</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
