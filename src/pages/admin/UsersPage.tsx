import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Users, Search, UserPlus, CheckCircle, XCircle, 
  Trash2, Key, Eye, EyeOff, Copy 
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { allPlansWithIndividual, planLabels, planPrices } from "@/lib/plans";

const userSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  first_name: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(100),
  last_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
});

type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  selected_plan: string | null;
  created_at: string;
  role?: string;
  status?: string;
};

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  teacher: "Enseignant",
  student: "Élève",
  parent: "Parent",
};

const roleBadgeVariants: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  teacher: "bg-accent text-accent-foreground",
  student: "bg-secondary text-secondary-foreground",
  parent: "bg-muted text-muted-foreground",
};

export default function UsersPage() {
  const { role } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  
  // Create form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "teacher" | "student" | "parent">("student");

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Password change
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, status');

      if (rolesError) throw rolesError;

      const profilesWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        role: rolesData?.find(r => r.user_id === profile.user_id)?.role,
        status: rolesData?.find(r => r.user_id === profile.user_id)?.status,
      }));

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleStatusChange = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: newStatus })
        .eq('user_id', userId);
      if (error) throw error;
      toast.success(newStatus === 'approved' ? 'Compte activé avec succès' : 'Compte rejeté');
      fetchProfiles();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const resetForm = () => {
    setEmail(""); setPassword(""); setFirstName(""); setLastName("");
    setPhone(""); setCity(""); setSelectedPlan(""); setNewUserRole("student");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = userSchema.safeParse({
        email, password, first_name: firstName, last_name: lastName, role: newUserRole,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      if (newUserRole === 'student' && !selectedPlan) {
        toast.error("Veuillez sélectionner un pack pour l'élève");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: validation.data.email,
          password: validation.data.password,
          first_name: validation.data.first_name,
          last_name: validation.data.last_name,
          role: validation.data.role,
          phone,
          city,
          selected_plan: newUserRole === 'student' ? selectedPlan : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${roleLabels[newUserRole]} créé avec succès`);
      setDialogOpen(false);
      resetForm();
      setTimeout(() => fetchProfiles(), 1000);
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error(error.message || "Erreur lors de la création");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userToDelete.user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Utilisateur supprimé avec succès");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordUser || !newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setChangingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-student-password', {
        body: { user_id: passwordUser.user_id, new_password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Mot de passe mis à jour avec succès");
      setPasswordDialogOpen(false);
      setNewPassword("");
      setPasswordUser(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
  };

  const getPlanLabel = (planId: string | null) => {
    if (!planId) return '-';
    return planLabels[planId] || planId;
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || profile.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getProfilesByRole = (roleFilter: string) => profiles.filter(p => p.role === roleFilter);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
            <p className="text-sm text-muted-foreground">
              {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''} au total
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Créer un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe *</Label>
                  <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0600000000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Casablanca" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rôle *</Label>
                  <Select value={newUserRole} onValueChange={(val: any) => setNewUserRole(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="student">Élève</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUserRole === 'student' && (
                  <div className="space-y-2">
                    <Label>Pack / Cours *</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un pack" /></SelectTrigger>
                      <SelectContent>
                        {allPlansWithIndividual.map(plan => {
                          const price = planPrices[plan.id];
                          return (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}{price ? ` - ${price.monthly} DH/mois` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { role: 'admin', label: 'Admins' },
            { role: 'teacher', label: 'Enseignants' },
            { role: 'student', label: 'Élèves' },
            { role: 'parent', label: 'Parents' },
          ].map((item) => (
            <motion.div key={item.role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-3 lg:p-4 border border-border">
              <div className="text-xl lg:text-2xl font-bold text-foreground">{getProfilesByRole(item.role).length}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrer par rôle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
              <SelectItem value="teacher">Enseignants</SelectItem>
              <SelectItem value="student">Élèves</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 bg-card rounded-xl border border-border">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-2 text-foreground">
              {searchQuery || selectedRole !== "all" ? "Aucun résultat" : "Aucun utilisateur"}
            </h3>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Mobile: Card view */}
            <div className="lg:hidden divide-y divide-border">
              {filteredProfiles.map((profile) => {
                const userRole = profile.role || 'unknown';
                const isPending = profile.status === 'pending';
                return (
                  <div key={profile.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{profile.first_name} {profile.last_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                        {profile.phone && <div className="text-xs text-muted-foreground">{profile.phone}</div>}
                        {profile.role === 'student' && profile.selected_plan && (
                          <div className="text-xs text-primary font-medium mt-1">Pack: {getPlanLabel(profile.selected_plan)}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isPending && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 text-xs">En attente</Badge>
                        )}
                        <Badge className={`${roleBadgeVariants[userRole] || ''} text-xs`}>
                          {roleLabels[userRole] || userRole}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isPending && (
                        <>
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 text-xs h-8" onClick={() => handleStatusChange(profile.user_id, 'approved')}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Activer
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 text-xs h-8" onClick={() => handleStatusChange(profile.user_id, 'rejected')}>
                            <XCircle className="h-3 w-3 mr-1" /> Rejeter
                          </Button>
                        </>
                      )}
                      {userRole !== 'admin' && (
                        <>
                          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => { setPasswordUser(profile); setPasswordDialogOpen(true); }}>
                            <Key className="h-3 w-3 mr-1" /> Mot de passe
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 text-xs h-8" onClick={() => { setUserToDelete(profile); setDeleteDialogOpen(true); }}>
                            <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => {
                    const userRole = profile.role || 'unknown';
                    const isPending = profile.status === 'pending';
                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-foreground whitespace-nowrap">
                              {profile.first_name} {profile.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{profile.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{profile.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge className={`${roleBadgeVariants[userRole] || ''} text-xs`}>
                            {roleLabels[userRole] || userRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {userRole === 'student' ? (
                            <span className="text-primary font-medium">{getPlanLabel(profile.selected_plan)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 text-xs">En attente</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-xs">Actif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isPending && (
                              <>
                                <Button size="sm" variant="ghost" className="text-emerald-600 h-8 w-8 p-0" onClick={() => handleStatusChange(profile.user_id, 'approved')} title="Activer">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => handleStatusChange(profile.user_id, 'rejected')} title="Rejeter">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {userRole !== 'admin' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setPasswordUser(profile); setPasswordDialogOpen(true); }} title="Changer le mot de passe">
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => { setUserToDelete(profile); setDeleteDialogOpen(true); }} title="Supprimer">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong> ({userToDelete?.email}) ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password change dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={(open) => { setPasswordDialogOpen(open); if (!open) { setNewPassword(""); setPasswordUser(null); setShowPassword(false); } }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Utilisateur : <strong>{passwordUser?.first_name} {passwordUser?.last_name}</strong> ({passwordUser?.email})
            </p>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generatePassword} title="Générer">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              {newPassword && showPassword && (
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{newPassword}</code>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(newPassword); toast.success("Copié !"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Annuler</Button>
            <Button variant="hero" onClick={handleChangePassword} disabled={changingPassword || newPassword.length < 6}>
              {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
