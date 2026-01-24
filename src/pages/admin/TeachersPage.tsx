import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Search, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  MapPin,
  GraduationCap,
  Award,
  Clock,
  FileText,
  User,
  X,
  Plus,
  Trash2,
  Upload,
  Image
} from "lucide-react";
import { toast } from "sonner";

type Teacher = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialization: string | null;
  certificates_url: string | null;
  address: string | null;
  city: string | null;
  diploma: string | null;
  years_experience: number | null;
  created_at: string;
  status?: string;
};

export default function TeachersPage() {
  const { role } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [addAvatarFile, setAddAvatarFile] = useState<File | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [addAvatarPreview, setAddAvatarPreview] = useState<string | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: "",
    bio: "",
    specialization: "",
    certificates_url: "",
    address: "",
    city: "",
    diploma: "",
    years_experience: 0,
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialization: "",
    certificates_url: "",
    address: "",
    city: "",
    diploma: "",
    years_experience: 0,
    avatar_url: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Get all approved teachers
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, status")
        .eq("role", "teacher")
        .eq("status", "approved");

      if (rolesError) throw rolesError;

      if (!teacherRoles || teacherRoles.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const userIds = teacherRoles.map((r) => r.user_id);

      // Get profiles for approved teachers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const teachersWithStatus = (profiles || []).map((profile) => ({
        ...profile,
        status: teacherRoles.find((r) => r.user_id === profile.user_id)?.status,
      }));

      setTeachers(teachersWithStatus);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Erreur lors du chargement des enseignants");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewDialogOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      phone: teacher.phone || "",
      bio: teacher.bio || "",
      specialization: teacher.specialization || "",
      certificates_url: teacher.certificates_url || "",
      address: teacher.address || "",
      city: teacher.city || "",
      diploma: teacher.diploma || "",
      years_experience: teacher.years_experience || 0,
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);

    try {
      // Upload avatar if new file provided
      let avatarUrl = selectedTeacher.avatar_url;
      if (editAvatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadAvatar(editAvatarFile, selectedTeacher.user_id);
        setUploadingAvatar(false);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          phone: editForm.phone || null,
          bio: editForm.bio || null,
          specialization: editForm.specialization || null,
          certificates_url: editForm.certificates_url || null,
          address: editForm.address || null,
          city: editForm.city || null,
          diploma: editForm.diploma || null,
          years_experience: editForm.years_experience || 0,
          avatar_url: avatarUrl,
        })
        .eq("id", selectedTeacher.id);

      if (error) throw error;

      toast.success("Informations mises à jour avec succès");
      setEditDialogOpen(false);
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      fetchTeachers();
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `teachers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAddAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAddAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTeacher = async () => {
    if (!addForm.first_name || !addForm.last_name) {
      toast.error("Veuillez remplir le prénom et le nom");
      return;
    }
    if (!addForm.email || !addForm.password) {
      toast.error("Veuillez remplir l'email et le mot de passe");
      return;
    }
    if (addForm.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSaving(true);

    try {
      // Upload avatar if provided
      let avatarUrl = addForm.avatar_url || null;
      if (addAvatarFile) {
        setUploadingAvatar(true);
        const tempUserId = crypto.randomUUID();
        avatarUrl = await uploadAvatar(addAvatarFile, tempUserId);
        setUploadingAvatar(false);
      }

      // Call the edge function to create the teacher with auth
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-teacher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: addForm.email,
            password: addForm.password,
            first_name: addForm.first_name,
            last_name: addForm.last_name,
            phone: addForm.phone || null,
            bio: addForm.bio || null,
            specialization: addForm.specialization || null,
            certificates_url: addForm.certificates_url || null,
            address: addForm.address || null,
            city: addForm.city || null,
            diploma: addForm.diploma || null,
            years_experience: addForm.years_experience || 0,
            avatar_url: avatarUrl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      toast.success(`Enseignant créé! Connexion: ${addForm.email} / ${addForm.password}`);
      setAddDialogOpen(false);
      setAddForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        bio: "",
        specialization: "",
        certificates_url: "",
        address: "",
        city: "",
        diploma: "",
        years_experience: 0,
        avatar_url: "",
      });
      setAddAvatarFile(null);
      setAddAvatarPreview(null);
      fetchTeachers();
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'ajout de l'enseignant");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.first_name} ${teacher.last_name} ?`)) {
      return;
    }

    try {
      // Delete user_role first
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", teacher.user_id);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", teacher.id);

      if (error) throw error;

      toast.success("Enseignant supprimé");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      teacher.first_name.toLowerCase().includes(searchLower) ||
      teacher.last_name.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      (teacher.specialization?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role={role || "admin"} />

      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              Gestion des Enseignants
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {teachers.length} enseignant{teachers.length > 1 ? "s" : ""} approuvé
              {teachers.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un enseignant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teachers.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {teachers.filter((t) => t.diploma).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Avec diplôme</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {teachers.filter((t) => t.certificates_url).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Certificats</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    20+
                  </div>
                  <div className="text-xs text-muted-foreground">Ans d'expérience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4 lg:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12 bg-card rounded-xl border border-border"
          >
            <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2 text-foreground">
              {searchQuery ? "Aucun résultat" : "Aucun enseignant"}
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground">
              {searchQuery
                ? "Essayez de modifier vos critères de recherche"
                : "Les enseignants approuvés apparaîtront ici"}
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
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={teacher.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(teacher.first_name, teacher.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">
                        {teacher.first_name} {teacher.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {teacher.email}
                      </div>
                      {teacher.specialization && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {teacher.specialization}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleView(teacher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTeacher(teacher)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Diplôme</TableHead>
                    <TableHead>Expérience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={teacher.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(teacher.first_name, teacher.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {teacher.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {teacher.phone}
                            </div>
                          )}
                          {teacher.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {teacher.city}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.specialization ? (
                          <Badge variant="secondary">{teacher.specialization}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.diploma ? (
                          <span className="text-sm">{teacher.diploma}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.years_experience ? (
                          <span className="text-sm">
                            {teacher.years_experience} an{teacher.years_experience > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTeacher(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profil de l'enseignant</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedTeacher.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedTeacher.first_name, selectedTeacher.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedTeacher.first_name} {selectedTeacher.last_name}
                    </h3>
                    {selectedTeacher.specialization && (
                      <Badge variant="secondary" className="mt-1">
                        {selectedTeacher.specialization}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{selectedTeacher.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Téléphone</div>
                      <div className="text-sm font-medium">
                        {selectedTeacher.phone || "Non renseigné"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Adresse</div>
                      <div className="text-sm font-medium">
                        {selectedTeacher.address || selectedTeacher.city || "Non renseigné"}
                        {selectedTeacher.address && selectedTeacher.city && `, ${selectedTeacher.city}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Expérience</div>
                      <div className="text-sm font-medium">
                        {selectedTeacher.years_experience
                          ? `${selectedTeacher.years_experience} an${selectedTeacher.years_experience > 1 ? "s" : ""}`
                          : "Non renseigné"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diploma & Certificates */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Formation & Certifications
                  </h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Diplôme</div>
                    <div className="text-sm">
                      {selectedTeacher.diploma || "Non renseigné"}
                    </div>
                  </div>
                  {selectedTeacher.certificates_url && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Certificats</div>
                      <a
                        href={selectedTeacher.certificates_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Voir les certificats
                      </a>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {selectedTeacher.bio && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Biographie</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTeacher.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier les informations</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      placeholder="Casablanca"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Années d'expérience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      value={editForm.years_experience}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          years_experience: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialité</Label>
                  <Input
                    id="specialization"
                    value={editForm.specialization}
                    onChange={(e) =>
                      setEditForm({ ...editForm, specialization: e.target.value })
                    }
                    placeholder="Mathématiques, Physique..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diploma">Diplôme</Label>
                  <Input
                    id="diploma"
                    value={editForm.diploma}
                    onChange={(e) =>
                      setEditForm({ ...editForm, diploma: e.target.value })
                    }
                    placeholder="Master en Mathématiques"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photo de profil</Label>
                  <div className="flex items-center gap-4">
                    {editAvatarPreview || selectedTeacher?.avatar_url ? (
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={editAvatarPreview || selectedTeacher?.avatar_url || undefined} />
                        <AvatarFallback><Image className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="edit_avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleEditAvatarChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG ou WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificates_url">URL des certificats</Label>
                  <Input
                    id="certificates_url"
                    value={editForm.certificates_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, certificates_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Parcours professionnel, motivations..."
                    rows={4}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button variant="hero" onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Teacher Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un enseignant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_first_name">Prénom *</Label>
                  <Input
                    id="add_first_name"
                    value={addForm.first_name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, first_name: e.target.value })
                    }
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_last_name">Nom *</Label>
                  <Input
                    id="add_last_name"
                    value={addForm.last_name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, last_name: e.target.value })
                    }
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_email">Email *</Label>
                  <Input
                    id="add_email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_password">Mot de passe *</Label>
                  <Input
                    id="add_password"
                    type="password"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm({ ...addForm, password: e.target.value })
                    }
                    placeholder="Minimum 6 caractères"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_phone">Téléphone</Label>
                  <Input
                    id="add_phone"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    placeholder="+212..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_specialization">Spécialité</Label>
                  <Input
                    id="add_specialization"
                    value={addForm.specialization}
                    onChange={(e) =>
                      setAddForm({ ...addForm, specialization: e.target.value })
                    }
                    placeholder="Mathématiques, Physique..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_diploma">Diplôme</Label>
                  <Input
                    id="add_diploma"
                    value={addForm.diploma}
                    onChange={(e) =>
                      setAddForm({ ...addForm, diploma: e.target.value })
                    }
                    placeholder="Master, Doctorat..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_years_experience">Années d'expérience</Label>
                  <Input
                    id="add_years_experience"
                    type="number"
                    value={addForm.years_experience}
                    onChange={(e) =>
                      setAddForm({ ...addForm, years_experience: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_city">Ville</Label>
                  <Input
                    id="add_city"
                    value={addForm.city}
                    onChange={(e) =>
                      setAddForm({ ...addForm, city: e.target.value })
                    }
                    placeholder="Casablanca, Rabat..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_address">Adresse</Label>
                  <Input
                    id="add_address"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <div className="flex items-center gap-4">
                  {addAvatarPreview ? (
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={addAvatarPreview} />
                      <AvatarFallback><Image className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="add_avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAddAvatarChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG ou WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_certificates_url">URL Certificats</Label>
                <Input
                  id="add_certificates_url"
                  value={addForm.certificates_url}
                  onChange={(e) =>
                    setAddForm({ ...addForm, certificates_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_bio">Biographie</Label>
                <Textarea
                  id="add_bio"
                  value={addForm.bio}
                  onChange={(e) =>
                    setAddForm({ ...addForm, bio: e.target.value })
                  }
                  placeholder="Parcours professionnel, motivations..."
                  rows={4}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleAddTeacher} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
