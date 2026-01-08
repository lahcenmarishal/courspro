import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Video,
  FileText,
  CreditCard,
  Bell,
  Settings,
  BarChart3,
  MessageSquare,
  LogOut,
  Award,
  BookMarked,
  Clock,
  Menu,
  X,
  UserPlus,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Role = "admin" | "teacher" | "student" | "parent";

interface DashboardSidebarProps {
  role: Role;
}

const adminLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Blog", href: "/dashboard/blog", icon: Newspaper },
  { label: "Demandes enseignants", href: "/dashboard/teacher-requests", icon: UserPlus },
  { label: "Enseignants", href: "/dashboard/teachers", icon: GraduationCap },
  { label: "Utilisateurs", href: "/dashboard/users", icon: Users },
  { label: "Années scolaires", href: "/dashboard/school-years", icon: Calendar },
  { label: "Niveaux", href: "/dashboard/levels", icon: GraduationCap },
  { label: "Matières", href: "/dashboard/subjects", icon: BookOpen },
  { label: "Classes", href: "/dashboard/classes", icon: Users },
  { label: "Emplois du temps", href: "/dashboard/schedule", icon: Calendar },
  { label: "Séances", href: "/dashboard/sessions", icon: Video },
  { label: "Évaluations", href: "/dashboard/evaluations", icon: FileText },
  { label: "Abonnements", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const teacherLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mon emploi du temps", href: "/dashboard/schedule", icon: Calendar },
  { label: "Mes classes", href: "/dashboard/classes", icon: GraduationCap },
  { label: "Mes cours", href: "/dashboard/sessions", icon: Video },
  { label: "Supports de cours", href: "/dashboard/resources", icon: BookMarked },
  { label: "Devoirs & Examens", href: "/dashboard/evaluations", icon: FileText },
  { label: "Présences", href: "/dashboard/attendance", icon: Clock },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
];

const studentLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mon emploi du temps", href: "/dashboard/schedule", icon: Calendar },
  { label: "Mes cours", href: "/dashboard/sessions", icon: Video },
  { label: "Ressources", href: "/dashboard/resources", icon: BookMarked },
  { label: "Devoirs", href: "/dashboard/homework", icon: FileText },
  { label: "Notes & Bulletins", href: "/dashboard/grades", icon: Award },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
];

const parentLinks = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Suivi scolaire", href: "/dashboard/tracking", icon: BarChart3 },
  { label: "Présences", href: "/dashboard/attendance", icon: Clock },
  { label: "Notes", href: "/dashboard/grades", icon: Award },
  { label: "Calendrier", href: "/dashboard/calendar", icon: Calendar },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
];

const linksByRole: Record<Role, typeof adminLinks> = {
  admin: adminLinks,
  teacher: teacherLinks,
  student: studentLinks,
  parent: parentLinks,
};

const roleLabels: Record<Role, string> = {
  admin: "Administration",
  teacher: "Enseignant",
  student: "Élève",
  parent: "Parent",
};

export const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const links = linksByRole[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (!user?.user_metadata) return 'U';
    const firstName = user.user_metadata.first_name || '';
    const lastName = user.user_metadata.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user?.user_metadata) return 'Utilisateur';
    const firstName = user.user_metadata.first_name || '';
    const lastName = user.user_metadata.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Utilisateur';
  };

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={onLinkClick}>
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-foreground">EduVirtual</div>
            <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 lg:p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 lg:mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">{getInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-foreground">{getDisplayName()}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => {
            handleSignOut();
            onLinkClick?.();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">EduVirtual</div>
              <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
            </div>
          </Link>
          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <SidebarContent onLinkClick={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile spacer for fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
};
