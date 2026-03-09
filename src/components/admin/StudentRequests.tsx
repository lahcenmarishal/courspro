import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Mail,
  User,
  Loader2,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  MapPin,
  Phone,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const planLabels: Record<string, string> = {
  'primaire': 'Primaire - 6ème année',
  'college-regional': 'Collège Pack Régional',
  'lycee-1bac-jihawi': '1 Bac Pack Aljihawi',
  'lycee-2bac-total': '2 Bac National Complet',
  'particulier-suivi': 'Suivi individuel',
};

const planPrices: Record<string, { monthly: number; annual: number }> = {
  'primaire': { monthly: 100, annual: 500 },
  'college-regional': { monthly: 150, annual: 700 },
  'lycee-1bac-jihawi': { monthly: 200, annual: 900 },
  'lycee-2bac-total': { monthly: 350, annual: 1500 },
  'particulier-suivi': { monthly: 0, annual: 0 },
};

interface StudentRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    city: string | null;
    phone: string | null;
    selected_plan: string | null;
  } | null;
}

export function StudentRequests() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentRequests();
  }, []);

  const fetchStudentRequests = async () => {
    setLoading(true);
    try {
      const { data: studentRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, status, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      if (!studentRoles || studentRoles.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = studentRoles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, city, phone, selected_plan")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const requestsWithProfiles = studentRoles.map((role) => ({
        ...role,
        profile: profilesMap.get(role.user_id) || null,
      }));

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error fetching student requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (roleId: string, userId: string, selectedPlan: string | null) => {
    setActionLoading(roleId);
    try {
      // Approve the student role
      const { error } = await supabase
        .from("user_roles")
        .update({ status: "approved" })
        .eq("id", roleId);

      if (error) throw error;

      // Auto-create subscription if a plan was selected (not particulier-suivi)
      if (selectedPlan && selectedPlan !== 'particulier-suivi') {
        const prices = planPrices[selectedPlan] || { monthly: 0, annual: 0 };
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const { error: subError } = await supabase.from("subscriptions").insert({
          student_id: userId,
          type: 'monthly',
          status: 'active',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          price_paid: prices.monthly,
          auto_renew: false,
        });

        if (subError) {
          console.error("Error creating subscription:", subError);
          toast.warning("Élève approuvé mais erreur lors de la création de l'abonnement");
        } else {
          toast.success("Élève approuvé et abonnement créé avec succès");
        }
      } else {
        toast.success("Élève approuvé avec succès");
      }

      fetchStudentRequests();
    } catch (error) {
      console.error("Error approving student:", error);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (roleId: string) => {
    setActionLoading(roleId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ status: "rejected" })
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Demande rejetée");
      fetchStudentRequests();
    } catch (error) {
      console.error("Error rejecting student:", error);
      toast.error("Erreur lors du rejet");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (roleId: string) => {
    setActionLoading(roleId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Élève supprimé avec succès");
      fetchStudentRequests();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedStudents = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base lg:text-lg font-semibold">Gestion des Élèves</h2>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {pendingRequests.length} demande(s) en attente • {approvedStudents.length} approuvé(s)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudentRequests}>
          <RefreshCw className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <h3 className="font-medium text-yellow-600">Demandes en attente</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {pendingRequests.map((request) => (
                <StudentRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleApprove(request.id, request.user_id, request.profile?.selected_plan || null)}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  getStatusBadge={getStatusBadge}
                  actionLoading={actionLoading}
                  showActions
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {approvedStudents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <h3 className="font-medium text-green-600">Élèves approuvés</h3>
          </div>
          <div className="space-y-2">
            {approvedStudents.map((request) => (
              <StudentRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id, request.user_id, request.profile?.selected_plan || null)}
                onReject={handleReject}
                onDelete={handleDelete}
                getStatusBadge={getStatusBadge}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </div>
      )}

      {rejectedRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-500" />
            <h3 className="font-medium text-red-600">Demandes rejetées</h3>
          </div>
          <div className="space-y-2">
            {rejectedRequests.map((request) => (
              <StudentRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                getStatusBadge={getStatusBadge}
                actionLoading={actionLoading}
                showReapprove
              />
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Aucun élève</h3>
          <p className="text-sm text-muted-foreground">
            Les demandes d'inscription des élèves apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  );
}

interface StudentRequestCardProps {
  request: StudentRequest;
  onApprove: (roleId: string) => void;
  onReject: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  actionLoading: string | null;
  showActions?: boolean;
  showReapprove?: boolean;
}

function StudentRequestCard({
  request,
  onApprove,
  onReject,
  onDelete,
  getStatusBadge,
  actionLoading,
  showActions = false,
  showReapprove = false,
}: StudentRequestCardProps) {
  const isLoading = actionLoading === request.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 bg-card rounded-lg border border-border"
    >
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {request.profile?.first_name?.charAt(0) || "?"}
            {request.profile?.last_name?.charAt(0) || ""}
          </span>
        </div>
        <div className="min-w-0 space-y-1">
          <div className="font-medium truncate">
            {request.profile?.first_name || "Nom inconnu"}{" "}
            {request.profile?.last_name || ""}
          </div>
          {request.profile?.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{request.profile.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{request.profile?.email || "Email inconnu"}</span>
          </div>
          {request.profile?.city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{request.profile.city}</span>
            </div>
          )}
          {request.profile?.selected_plan && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-3 w-3 text-primary" />
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                {planLabels[request.profile.selected_plan] || request.profile.selected_plan}
              </Badge>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Demande le {format(new Date(request.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {getStatusBadge(request.status)}

        {showActions && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
              onClick={() => onApprove(request.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approuver
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
              onClick={() => onReject(request.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </>
              )}
            </Button>
          </>
        )}

        {showReapprove && (
          <Button
            size="sm"
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
            onClick={() => onApprove(request.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Réapprouver
              </>
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet élève ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement le rôle élève de{" "}
                <strong>
                  {request.profile?.first_name} {request.profile?.last_name}
                </strong>
                . Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(request.id)}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
