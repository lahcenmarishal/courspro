import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    avatar_url: null,
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    session_reminders: true,
    homework_alerts: true,
    grade_notifications: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast.success('Un email de réinitialisation a été envoyé');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar role={role || 'student'} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">Gérer votre compte et vos préférences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Apparence
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Modifier vos informations de profil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{profile.first_name} {profile.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input 
                        id="firstName"
                        value={profile.first_name}
                        onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input 
                        id="lastName"
                        value={profile.last_name}
                        onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications par email</h4>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                    </div>
                    <Switch 
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, email_notifications: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rappels de séances</h4>
                      <p className="text-sm text-muted-foreground">Recevoir des rappels avant les séances</p>
                    </div>
                    <Switch 
                      checked={notifications.session_reminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, session_reminders: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes de devoirs</h4>
                      <p className="text-sm text-muted-foreground">Être alerté des nouveaux devoirs</p>
                    </div>
                    <Switch 
                      checked={notifications.homework_alerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, homework_alerts: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications de notes</h4>
                      <p className="text-sm text-muted-foreground">Être notifié des nouvelles notes</p>
                    </div>
                    <Switch 
                      checked={notifications.grade_notifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, grade_notifications: checked})}
                    />
                  </div>

                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer les préférences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité du compte</CardTitle>
                  <CardDescription>Gérer la sécurité de votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Changer le mot de passe</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Un email sera envoyé à votre adresse pour réinitialiser votre mot de passe
                    </p>
                    <Button variant="outline" onClick={handleChangePassword}>
                      Envoyer le lien de réinitialisation
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Sessions actives</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Vous êtes actuellement connecté sur cet appareil
                    </p>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Navigateur actuel</p>
                          <p className="text-sm text-muted-foreground">Dernière activité: maintenant</p>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Actif</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>Personnaliser l'apparence de l'application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Thème</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="h-20 rounded-lg bg-white border mb-2"></div>
                        <p className="text-sm font-medium">Clair</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="h-20 rounded-lg bg-zinc-900 mb-2"></div>
                        <p className="text-sm font-medium">Sombre</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:border-primary transition-colors border-primary">
                        <div className="h-20 rounded-lg bg-gradient-to-b from-white to-zinc-900 mb-2"></div>
                        <p className="text-sm font-medium">Système</p>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4">Langue</h4>
                    <p className="text-sm text-muted-foreground">Français (France)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
