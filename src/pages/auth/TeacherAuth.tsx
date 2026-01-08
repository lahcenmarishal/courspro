import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, Lock, ArrowLeft, Loader2, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type AccountStatus = 'none' | 'pending' | 'approved' | 'rejected';

export default function TeacherAuth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('none');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role === 'teacher') {
      checkTeacherStatus(user.id);
    }
  }, [user, role, navigate]);

  const checkTeacherStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('status')
        .eq('user_id', userId)
        .eq('role', 'teacher')
        .single();

      if (error) throw error;

      if (data?.status === 'approved') {
        navigate('/dashboard');
      } else if (data?.status === 'pending') {
        setAccountStatus('pending');
      } else if (data?.status === 'rejected') {
        setAccountStatus('rejected');
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // First check if this teacher account exists and its status
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingUser?.user) {
        // Check the teacher status before allowing login
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('status, role')
          .eq('user_id', existingUser.user.id)
          .single();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          toast.error('Compte non trouvé');
          setLoading(false);
          return;
        }

        if (roleData.role === 'teacher') {
          if (roleData.status === 'pending') {
            await supabase.auth.signOut();
            toast.error('Votre compte est en attente de validation par un administrateur');
            setAccountStatus('pending');
            setLoading(false);
            return;
          } else if (roleData.status === 'rejected') {
            await supabase.auth.signOut();
            toast.error('Votre demande d\'accès a été rejetée');
            setAccountStatus('rejected');
            setLoading(false);
            return;
          }
        }

        // If approved or other role, proceed with normal auth flow
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        toast.error('Email ou mot de passe incorrect');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = signupSchema.safeParse({ 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Un compte existe déjà avec cet email');
        } else {
          toast.error(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'teacher',
            status: 'pending',
          });

        if (roleError) {
          console.error('Error creating teacher role:', roleError);
          toast.error('Erreur lors de la création du compte');
          setLoading(false);
          return;
        }

        // Sign out the user immediately - they should not be logged in until approved
        await supabase.auth.signOut();
        
        setRegistrationSuccess(true);
        toast.success('Demande envoyée avec succès !');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (accountStatus === 'pending' || registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-2xl p-8 shadow-lg border border-border text-center"
        >
          <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Demande en attente</h1>
          <p className="text-muted-foreground mb-6">
            Votre demande d'inscription en tant qu'enseignant a été envoyée avec succès. 
            Un administrateur examinera votre demande et vous serez notifié une fois approuvé.
          </p>
          <div className="bg-yellow-500/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Vous recevrez un email une fois votre compte validé.</span>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (accountStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-2xl p-8 shadow-lg border border-border text-center"
        >
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Demande rejetée</h1>
          <p className="text-muted-foreground mb-6">
            Malheureusement, votre demande d'inscription en tant qu'enseignant a été rejetée. 
            Veuillez contacter l'administration pour plus d'informations.
          </p>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Espace Enseignant</h1>
                <p className="text-sm text-muted-foreground">
                  Connectez-vous ou demandez un accès
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Demander un accès</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email enseignant</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enseignant@classconnect.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jean"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enseignant@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        Votre demande sera examinée par un administrateur. 
                        Vous recevrez une notification une fois votre compte approuvé.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer ma demande
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--secondary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--secondary)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-secondary-foreground">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-lg"
          >
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez notre équipe
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Devenez enseignant sur ClassConnect et accédez à des outils 
              modernes pour gérer vos cours et suivre vos élèves.
            </p>
            
            <div className="space-y-4">
              {[
                'Sessions de cours en direct',
                'Création de devoirs et évaluations',
                'Suivi des présences',
                'Communication avec les parents',
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm">✓</span>
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}