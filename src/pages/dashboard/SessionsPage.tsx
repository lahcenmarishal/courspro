import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleMeet } from "@/hooks/useGoogleMeet";
import { useAttendance } from "@/hooks/useAttendance";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Video, 
  Plus,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Link2,
  Search,
  Filter,
  MonitorPlay,
  PlayCircle,
  Zap,
  Loader2,
  Hand
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SessionAttendanceList } from "@/components/SessionAttendanceList";
import { DirectSessionDialog } from "@/components/dashboard/DirectSessionDialog";

import { EndSessionDialog } from "@/components/dashboard/EndSessionDialog";

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  assignment: {
    id: string;
    teacher_id: string;
    subject: { name: string; color: string } | null;
    class: { name: string } | null;
  } | null;
}

interface Session {
  id: string;
  session_date: string;
  status: string;
  google_meet_link: string | null;
  recording_url: string | null;
  notes: string | null;
  schedule_slot: ScheduleSlot | null;
  // Direct session fields
  title?: string | null;
  is_direct?: boolean;
  subject?: { name: string; color: string } | null;
  class?: { name: string } | null;
  teacher_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function SessionsPage() {
  const { role, user, loading: authLoading } = useAuth();
  const { createMeetLink, isLoading: isGeneratingMeet, isAuthenticating } = useGoogleMeet();
  const { recordJoin } = useAttendance();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");

  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  
  // Presence confirmation states
  const [confirmingPresence, setConfirmingPresence] = useState<string | null>(null);
  const [presenceConfirmed, setPresenceConfirmed] = useState<Set<string>>(new Set());
  
  // Direct session dialog state
  const [isDirectSessionDialogOpen, setIsDirectSessionDialogOpen] = useState(false);
  
  // End session dialog state
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false);
  const [sessionToEnd, setSessionToEnd] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchScheduleSlots();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          id,
          session_date,
          status,
          google_meet_link,
          recording_url,
          notes,
          title,
          is_direct,
          start_time,
          end_time,
          teacher_id,
          subject:subjects(name, color),
          class:classes(name),
          schedule_slot:schedule_slots(
            id,
            day_of_week,
            start_time,
            end_time,
            room,
            assignment:teacher_assignments(
              id,
              teacher_id,
              subject:subjects(name, color),
              class:classes(name)
            )
          )
        `)
        .order("session_date", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Erreur lors du chargement des séances");
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleSlots = async () => {
    const { data, error } = await supabase
      .from("schedule_slots")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room,
        assignment:teacher_assignments(
          id,
          teacher_id,
          subject:subjects(name, color),
          class:classes(name)
        )
      `);

    if (error) {
      console.error("Error fetching schedule slots:", error);
      return;
    }
    setScheduleSlots(data || []);
  };

  const handleGenerateGoogleMeet = async () => {
    if (!selectedSlot || !sessionDate) {
      toast.error("Veuillez d'abord sélectionner un créneau et une date");
      return;
    }

    const slot = scheduleSlots.find(s => s.id === selectedSlot);
    const subjectName = slot?.assignment?.subject?.name || 'Cours';
    const className = slot?.assignment?.class?.name || '';
    const sessionTitle = `${subjectName} - ${className}`;
    
    const result = await createMeetLink({
      sessionTitle,
      sessionDate: format(sessionDate, "yyyy-MM-dd"),
      startTime: slot?.start_time?.slice(0, 5) || "09:00",
      endTime: slot?.end_time?.slice(0, 5) || "10:00",
    });

    if (result.success && result.meetLink) {
      setMeetLink(result.meetLink);
    }
  };

  const handleConfirmPresence = async (session: Session) => {
    if (!user) return;
    
    setConfirmingPresence(session.id);
    
    try {
      await recordJoin(session.id);
      setPresenceConfirmed(prev => new Set(prev).add(session.id));
      
      // Open Google Meet in new tab
      if (session.google_meet_link) {
        window.open(session.google_meet_link, '_blank');
      }
    } catch (error) {
      console.error("Error confirming presence:", error);
      toast.error("Erreur lors de l'enregistrement de la présence");
    } finally {
      setConfirmingPresence(null);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedSlot || !sessionDate) {
      toast.error("Veuillez sélectionner un créneau et une date");
      return;
    }

    try {
      const { error } = await supabase.from("sessions").insert({
        schedule_slot_id: selectedSlot,
        session_date: format(sessionDate, "yyyy-MM-dd"),
        google_meet_link: meetLink || null,
        notes: notes || null,
        status: "scheduled"
      });

      if (error) throw error;

      toast.success("Séance créée avec succès");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Erreur lors de la création de la séance");
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          google_meet_link: meetLink || null,
          notes: notes || null,
          recording_url: recordingUrl || null,
          status: editingSession.status
        })
        .eq("id", editingSession.id);

      if (error) throw error;

      toast.success("Séance mise à jour");
      setIsEditDialogOpen(false);
      setEditingSession(null);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Statut mis à jour");
      fetchSessions();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) return;

    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;

      toast.success("Séance supprimée");
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditDialog = (session: Session) => {
    setEditingSession(session);
    setMeetLink(session.google_meet_link || "");
    setNotes(session.notes || "");
    setRecordingUrl(session.recording_url || "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedSlot("");
    setSessionDate(new Date());
    setMeetLink("");
    setNotes("");
    setRecordingUrl("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Planifiée</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">En cours</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Terminée</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEEE d MMMM", { locale: fr });
  };

  const filteredSessions = sessions.filter((session) => {
    // Search in both regular sessions and direct sessions
    const subjectName = session.is_direct 
      ? session.subject?.name 
      : session.schedule_slot?.assignment?.subject?.name;
    const className = session.is_direct 
      ? session.class?.name 
      : session.schedule_slot?.assignment?.class?.name;
    const sessionTitle = session.title || '';
    
    const matchesSearch = 
      !searchQuery ||
      subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sessionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    
    const sessionDate = new Date(session.session_date);
    const matchesTab = 
      selectedTab === "all" ||
      (selectedTab === "upcoming" && !isPast(sessionDate)) ||
      (selectedTab === "past" && isPast(sessionDate)) ||
      (selectedTab === "today" && isToday(sessionDate));

    return matchesSearch && matchesStatus && matchesTab;
  });

  const todayCount = sessions.filter(s => isToday(new Date(s.session_date))).length;
  const upcomingCount = sessions.filter(s => !isPast(new Date(s.session_date))).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const effectiveRole = role || "student";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role={effectiveRole} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              Gestion des séances
            </h1>
            <p className="text-muted-foreground">
              Planifiez et gérez vos cours en ligne
            </p>
          </div>
          
          {(effectiveRole === "admin" || effectiveRole === "teacher") && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDirectSessionDialogOpen(true)}
                className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
              >
                <Zap className="h-4 w-4 mr-2" />
                Séance directe
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle séance
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer une séance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Créneau horaire</Label>
                    <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un créneau" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleSlots.map(slot => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {DAYS[slot.day_of_week - 1]} {slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)} • {slot.assignment?.subject?.name} • {slot.assignment?.class?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date de la séance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !sessionDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {sessionDate ? format(sessionDate, "PPP", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={sessionDate}
                          onSelect={setSessionDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Lien Google Meet</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://meet.google.com/..."
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        disabled={isGeneratingMeet || isAuthenticating}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGenerateGoogleMeet} 
                        title="Générer un lien Google Meet"
                        disabled={isGeneratingMeet || isAuthenticating}
                      >
                        {isGeneratingMeet || isAuthenticating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isAuthenticating 
                        ? "Autorisation Google en cours..."
                        : "Cliquez sur l'icône pour générer automatiquement un lien Google Meet"
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optionnel)</Label>
                    <Textarea 
                      placeholder="Notes pour cette séance..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSession}>
                      Créer la séance
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{todayCount}</div>
                <div className="text-sm text-muted-foreground">Aujourd'hui</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{upcomingCount}</div>
                <div className="text-sm text-muted-foreground">À venir</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sessions.filter(s => s.status === "completed").length}</div>
                <div className="text-sm text-muted-foreground">Terminées</div>
              </div>
            </div>
          </Card>
        </div>


        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une séance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="scheduled">Planifiées</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">
              Aujourd'hui ({todayCount})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              À venir ({upcomingCount})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passées
            </TabsTrigger>
            <TabsTrigger value="all">
              Toutes
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-muted rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Aucune séance</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Aucune séance ne correspond à votre recherche" : "Aucune séance planifiée"}
                </p>
                {(role === "admin" || role === "teacher") && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une séance
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "hover:border-primary/30 transition-all",
                      session.is_direct && "border-l-4 border-l-amber-500"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: (
                                session.is_direct 
                                  ? (session.subject?.color || "#F59E0B")
                                  : (session.schedule_slot?.assignment?.subject?.color || "#3B82F6")
                              ) + "20" 
                            }}
                          >
                            {session.is_direct ? (
                              <Zap 
                                className="h-7 w-7" 
                                style={{ color: session.subject?.color || "#F59E0B" }}
                              />
                            ) : (
                              <Video 
                                className="h-7 w-7" 
                                style={{ color: session.schedule_slot?.assignment?.subject?.color || "#3B82F6" }}
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {session.is_direct 
                                  ? (session.title || session.subject?.name || "Séance directe")
                                  : (session.schedule_slot?.assignment?.subject?.name || "Cours")
                                }
                              </h3>
                              {session.is_direct && (
                                <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
                                  Direct
                                </Badge>
                              )}
                              {getStatusBadge(session.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getDateLabel(session.session_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.is_direct 
                                  ? `${session.start_time?.slice(0, 5) || '--:--'} - ${session.end_time?.slice(0, 5) || '--:--'}`
                                  : `${session.schedule_slot?.start_time.slice(0, 5)} - ${session.schedule_slot?.end_time.slice(0, 5)}`
                                }
                              </span>
                              {(session.is_direct ? session.class?.name : session.schedule_slot?.assignment?.class?.name) && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {session.is_direct ? session.class?.name : session.schedule_slot?.assignment?.class?.name}
                                </span>
                              )}
                              {!session.is_direct && session.schedule_slot?.room && (
                                <span>Salle: {session.schedule_slot.room}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {session.google_meet_link && session.status === "in_progress" && (
                              <>
                                {role === "student" ? (
                                  // Student: Show presence confirmation button
                                  presenceConfirmed.has(session.id) ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Présence confirmée
                                    </Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleConfirmPresence(session)}
                                      disabled={confirmingPresence === session.id}
                                    >
                                      {confirmingPresence === session.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Hand className="h-4 w-4 mr-2" />
                                      )}
                                      Je suis présent
                                    </Button>
                                  )
                                ) : (
                                  // Teacher/Admin: Direct access button
                                  <Button 
                                    size="sm" 
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={() => window.open(session.google_meet_link!, '_blank')}
                                  >
                                    <Video className="h-4 w-4 mr-2" />
                                    Rejoindre
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(session.google_meet_link!, '_blank')}
                                  title="Ouvrir dans un nouvel onglet"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {(role === "admin" || role === "teacher") && (
                              <>
                                {session.status === "scheduled" && isToday(new Date(session.session_date)) && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateStatus(session.id, "in_progress")}
                                  >
                                    Démarrer
                                  </Button>
                                )}
                                {session.status === "in_progress" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSessionToEnd(session);
                                      setEndSessionDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Terminer
                                  </Button>
                                )}
                                {(session.status === "in_progress" || session.status === "completed") && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Users className="h-4 w-4 mr-2" />
                                        Présences
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80" align="end">
                                      <SessionAttendanceList sessionId={session.id} />
                                    </PopoverContent>
                                  </Popover>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(session)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {(session.notes || session.recording_url) && (
                          <div className="mt-4 space-y-2">
                            {session.recording_url && (
                              <a 
                                href={session.recording_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg text-sm hover:bg-primary/10 transition-colors"
                              >
                                <PlayCircle className="h-4 w-4 text-primary" />
                                <span className="font-medium">Voir l'enregistrement</span>
                                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                              </a>
                            )}
                            {session.notes && (
                              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                <span className="font-medium">Notes:</span> {session.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier la séance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Lien Google Meet</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://meet.google.com/..."
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Collez un lien Google Meet existant
                </p>
              </div>

              <div className="space-y-2">
                <Label>Lien d'enregistrement (optionnel)</Label>
                <Input 
                  placeholder="https://youtube.com/watch?v=... ou lien Drive"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ajoutez un lien YouTube, Google Drive ou autre pour l'enregistrement
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Notes pour cette séance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingSession(null); resetForm(); }}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateSession}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      {/* Direct Session Dialog */}
      {user && (effectiveRole === "admin" || effectiveRole === "teacher") && (
        <DirectSessionDialog
          open={isDirectSessionDialogOpen}
          onOpenChange={setIsDirectSessionDialogOpen}
          userId={user.id}
          userRole={effectiveRole as "admin" | "teacher"}
          onSessionCreated={fetchSessions}
        />
      )}
      
      {/* End Session Dialog */}
      {sessionToEnd && (
        <EndSessionDialog
          open={endSessionDialogOpen}
          onOpenChange={(open) => {
            setEndSessionDialogOpen(open);
            if (!open) setSessionToEnd(null);
          }}
          sessionId={sessionToEnd.id}
          sessionTitle={
            sessionToEnd.is_direct 
              ? (sessionToEnd.title || sessionToEnd.subject?.name || "Séance directe")
              : (sessionToEnd.schedule_slot?.assignment?.subject?.name || "Séance")
          }
          currentNotes={sessionToEnd.notes || ""}
          currentRecordingUrl={sessionToEnd.recording_url || ""}
          onSessionEnded={fetchSessions}
        />
      )}
    </div>
  );
}