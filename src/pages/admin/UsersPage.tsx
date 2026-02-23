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
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Users, Search, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "teacher" | "student" | "parent">("teacher");

  const fetchProfiles = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, status');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
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

  useEffect(() => {
    fetchProfiles();
  }, []);

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
      console.error('Error updating status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setNewUserRole("teacher");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validation = userSchema.safeParse({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: newUserRole,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setSaving(false);
        return;
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            first_name: validation.data.first_name,
            last_name: validation.data.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création de l'utilisateur");

      // Add role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: validation.data.role,
        });

      if (roleError) {
        console.error('Error adding role:', roleError);
      }

      toast.success(`${roleLabels[newUserRole]} créé avec succès`);
      setDialogOpen(false);
      resetForm();
      
      // Wait a bit for the trigger to create the profile
      setTimeout(() => fetchProfiles(), 1000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message?.includes('already registered')) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error(error.message || "Erreur lors de la création");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "all" || profile.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getProfilesByRole = (roleFilter: string) => {
    return profiles.filter(p => p.role === roleFilter);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || 'admin'} />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''} au total
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="w-full sm:w-auto lg:size-default">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Créer un utilisateur</span>
                <span className="sm:hidden">Créer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@ecole.fr"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle *</Label>
                  <Select value={newUserRole} onValueChange={(val: any) => setNewUserRole(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="student">Élève</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {[
            { role: 'admin', label: 'Admins', color: 'primary' },
            { role: 'teacher', label: 'Enseignants', color: 'accent' },
            { role: 'student', label: 'Élèves', color: 'secondary' },
            { role: 'parent', label: 'Parents', color: 'muted' },
          ].map((item) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-3 lg:p-4 border border-border"
            >
              <div className="text-xl lg:text-2xl font-bold text-foreground">{getProfilesByRole(item.role).length}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <Users className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2 text-foreground">
              {searchQuery || selectedRole !== "all" ? "Aucun résultat" : "Aucun utilisateur"}
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              {searchQuery || selectedRole !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par créer des utilisateurs"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Mobile: Card view */}
            <div className="lg:hidden divide-y divide-border">
              {filteredProfiles.map((profile) => {
                const userRole = profile.role || 'unknown';
                const isPending = profile.status === 'pending';
                return (
                  <div key={profile.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          {profile.first_name} {profile.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">
                            En attente
                          </Badge>
                        )}
                        <Badge className={roleBadgeVariants[userRole] || ''}>
                          {roleLabels[userRole] || userRole}
                        </Badge>
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex gap-2 mt-3 ml-13">
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handleStatusChange(profile.user_id, 'approved')}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Activer
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleStatusChange(profile.user_id, 'rejected')}>
                          <XCircle className="h-3 w-3 mr-1" /> Rejeter
                        </Button>
                      </div>
                    )}
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
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Actions</TableHead>
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
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {profile.first_name} {profile.last_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleBadgeVariants[userRole] || ''}>
                            {roleLabels[userRole] || userRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">En attente</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">Actif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {isPending && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handleStatusChange(profile.user_id, 'approved')}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Activer
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleStatusChange(profile.user_id, 'rejected')}>
                                <XCircle className="h-3 w-3 mr-1" /> Rejeter
                              </Button>
                            </div>
                          )}
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
    </div>
  );
}
