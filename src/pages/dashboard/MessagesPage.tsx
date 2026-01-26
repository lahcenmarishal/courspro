import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  MessageSquare, 
  Search,
  Send,
  Plus,
  Inbox,
  SendHorizontal,
  Trash2,
  Reply,
  X,
  Mail,
  MailOpen
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface Message {
  id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender?: { first_name: string; last_name: string } | null;
  recipient?: { first_name: string; last_name: string } | null;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function MessagesPage() {
  const { role, user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");

  // Compose form state
  const [recipientId, setRecipientId] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [user, tab]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      let query = supabase.from("messages").select("*");
      
      if (tab === "inbox") {
        query = query.eq("recipient_id", user.id);
      } else {
        query = query.eq("sender_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch sender/recipient profiles
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          const otherId = tab === "inbox" ? msg.sender_id : msg.recipient_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", otherId)
            .maybeSingle();
          
          return {
            ...msg,
            [tab === "inbox" ? "sender" : "recipient"]: profile
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email")
      .neq("user_id", user?.id);
    
    setUsers(data?.map(p => ({ 
      id: p.user_id, 
      first_name: p.first_name, 
      last_name: p.last_name,
      email: p.email 
    })) || []);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
    
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, is_read: true } : m
    ));
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && tab === "inbox") {
      markAsRead(message.id);
    }
  };

  const handleSendMessage = async () => {
    if (!recipientId || !messageSubject || !messageContent || !user) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject: messageSubject,
        content: messageContent
      });

      if (error) throw error;

      toast.success("Message envoyé");
      setIsComposeOpen(false);
      setRecipientId("");
      setMessageSubject("");
      setMessageContent("");
      if (tab === "sent") fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleReply = (message: Message) => {
    setRecipientId(message.sender_id);
    setMessageSubject(`Re: ${message.subject}`);
    setMessageContent("");
    setIsComposeOpen(true);
  };

  const filteredMessages = messages.filter((msg) => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read && tab === "inbox").length;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

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
              <MessageSquare className="h-6 w-6 text-primary" />
              Messagerie
            </h1>
            <p className="text-muted-foreground">
              Communiquez avec les enseignants, élèves et parents
            </p>
          </div>
          
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouveau message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Destinataire</Label>
                  <Select value={recipientId} onValueChange={setRecipientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un destinataire" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Objet</Label>
                  <Input 
                    placeholder="Objet du message" 
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Écrivez votre message..." 
                    rows={6}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSendMessage} disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Messages List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "inbox" | "sent")}>
                <TabsList className="w-full">
                  <TabsTrigger value="inbox" className="flex-1 gap-2">
                    <Inbox className="h-4 w-4" />
                    Reçus
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex-1 gap-2">
                    <SendHorizontal className="h-4 w-4" />
                    Envoyés
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-2 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Aucun message trouvé" : "Aucun message"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message, index) => {
                    const person = tab === "inbox" ? message.sender : message.recipient;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelectMessage(message)}
                        className={`
                          flex items-start gap-3 p-4 cursor-pointer transition-colors
                          ${selectedMessage?.id === message.id ? "bg-primary/5" : "hover:bg-muted/50"}
                          ${!message.is_read && tab === "inbox" ? "bg-primary/5" : ""}
                        `}
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(person?.first_name, person?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm truncate ${!message.is_read && tab === "inbox" ? "font-semibold" : ""}`}>
                              {person?.first_name} {person?.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <div className={`text-sm truncate ${!message.is_read && tab === "inbox" ? "font-medium" : "text-muted-foreground"}`}>
                            {message.subject}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {message.content.substring(0, 50)}...
                          </div>
                        </div>
                        {!message.is_read && tab === "inbox" && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="lg:col-span-2 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(
                              (tab === "inbox" ? selectedMessage.sender : selectedMessage.recipient)?.first_name,
                              (tab === "inbox" ? selectedMessage.sender : selectedMessage.recipient)?.last_name
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {(tab === "inbox" ? selectedMessage.sender : selectedMessage.recipient)?.first_name}{" "}
                            {(tab === "inbox" ? selectedMessage.sender : selectedMessage.recipient)?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedMessage.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {tab === "inbox" && (
                          <Button variant="outline" size="sm" onClick={() => handleReply(selectedMessage)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Répondre
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-semibold mb-4">{selectedMessage.subject}</h2>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {selectedMessage.content}
                    </div>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="font-medium text-muted-foreground">
                      Sélectionnez un message pour le lire
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </main>
    </div>
  );
}