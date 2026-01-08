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

interface TeacherRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export function TeacherRequests() {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherRequests();
  }, []);

  const fetchTeacherRequests = async () => {
    setLoading(true);
    try {
      // Get all teacher roles
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, status, created_at")
        .eq("role", "teacher")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      if (!teacherRoles || teacherRoles.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get profiles for all teachers
      const userIds = teacherRoles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const requestsWithProfiles = teacherRoles.map((role) => ({
        ...role,
        profile: profilesMap.get(role.user_id) || null,
      }));

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error fetching teacher requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (roleId: string, userId: string) => {
    setActionLoading(roleId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ status: "approved" })
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Enseignant approuvé avec succès");
      fetchTeacherRequests();
    } catch (error) {
      console.error("Error approving teacher:", error);
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
      fetchTeacherRequests();
    } catch (error) {
      console.error("Error rejecting teacher:", error);
      toast.error("Erreur lors du rejet");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (roleId: string, userId: string) => {
    setActionLoading(roleId);
    try {
      // Delete the role first
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (roleError) throw roleError;

      toast.success("Enseignant supprimé avec succès");
      fetchTeacherRequests();
    } catch (error) {
      console.error("Error deleting teacher:", error);
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
  const approvedTeachers = requests.filter((r) => r.status === "approved");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base lg:text-lg font-semibold">Gestion des Enseignants</h2>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {pendingRequests.length} demande(s) en attente • {approvedTeachers.length} approuvé(s)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTeacherRequests}>
          <RefreshCw className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <h3 className="font-medium text-yellow-600">Demandes en attente</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {pendingRequests.map((request) => (
                <TeacherRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
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

      {/* Approved Teachers */}
      {approvedTeachers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <h3 className="font-medium text-green-600">Enseignants approuvés</h3>
          </div>
          <div className="space-y-2">
            {approvedTeachers.map((request) => (
              <TeacherRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                getStatusBadge={getStatusBadge}
                actionLoading={actionLoading}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-500" />
            <h3 className="font-medium text-red-600">Demandes rejetées</h3>
          </div>
          <div className="space-y-2">
            {rejectedRequests.map((request) => (
              <TeacherRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                getStatusBadge={getStatusBadge}
                actionLoading={actionLoading}
                showActions={false}
                showReapprove
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Aucun enseignant</h3>
          <p className="text-sm text-muted-foreground">
            Les demandes d'inscription des enseignants apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  );
}

interface TeacherRequestCardProps {
  request: TeacherRequest;
  onApprove: (roleId: string, userId: string) => void;
  onReject: (roleId: string) => void;
  onDelete: (roleId: string, userId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  actionLoading: string | null;
  showActions?: boolean;
  showReapprove?: boolean;
}

function TeacherRequestCard({
  request,
  onApprove,
  onReject,
  onDelete,
  getStatusBadge,
  actionLoading,
  showActions = false,
  showReapprove = false,
}: TeacherRequestCardProps) {
  const isLoading = actionLoading === request.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-secondary">
            {request.profile?.first_name?.charAt(0) || "?"}
            {request.profile?.last_name?.charAt(0) || ""}
          </span>
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {request.profile?.first_name || "Nom inconnu"}{" "}
            {request.profile?.last_name || ""}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{request.profile?.email || "Email inconnu"}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
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
              onClick={() => onApprove(request.id, request.user_id)}
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
            onClick={() => onApprove(request.id, request.user_id)}
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
              <AlertDialogTitle>Supprimer cet enseignant ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement le compte enseignant de{" "}
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
                onClick={() => onDelete(request.id, request.user_id)}
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
