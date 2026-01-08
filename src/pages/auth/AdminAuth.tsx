import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export default function AdminAuth() {
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [isBootstrapMode, setIsBootstrapMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  // Check if admin exists
  useEffect(() => {
    const checkAdminExists = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (!error && (!data || data.length === 0)) {
        setShowBootstrap(true);
      }
    };
    checkAdminExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou mot de passe incorrect');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setBootstrapLoading(false);
        return;
      }

      if (!firstName.trim() || !lastName.trim()) {
        toast.error('Veuillez remplir tous les champs');
        setBootstrapLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
        body: {
          email: email.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });

      if (error) {
        toast.error(error.message || 'Erreur lors de la création du compte admin');
        return;
      }

      if (data?.error) {
        if (data.error === 'Admin already exists') {
          toast.error('Un administrateur existe déjà');
          setShowBootstrap(false);
          setIsBootstrapMode(false);
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success('Compte administrateur créé ! Vous pouvez maintenant vous connecter.');
      setIsBootstrapMode(false);
      setShowBootstrap(false);
      // Reset form but keep email
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      console.error('Bootstrap error:', error);
      toast.error('Une erreur est survenue lors de la création du compte');
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
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
              <div className="h-12 w-12 rounded-xl bg-destructive flex items-center justify-center">
                <Shield className="h-6 w-6 text-destructive-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isBootstrapMode ? 'Créer le compte Admin' : 'Administration'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isBootstrapMode 
                    ? 'Configuration initiale de la plateforme'
                    : 'Accès réservé aux administrateurs'
                  }
                </p>
              </div>
            </div>

            {isBootstrapMode ? (
              <form onSubmit={handleBootstrap} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email administrateur</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@classconnect.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
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
                  className="w-full bg-destructive hover:bg-destructive/90" 
                  size="lg"
                  disabled={bootstrapLoading}
                >
                  {bootstrapLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le compte Admin
                </Button>

                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsBootstrapMode(false)}
                >
                  Annuler
                </Button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email administrateur</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@classconnect.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
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
                    className="w-full bg-destructive hover:bg-destructive/90" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter en tant qu'Admin
                  </Button>
                </form>

                {showBootstrap && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-muted rounded-lg border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <span className="font-medium">Première configuration</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Aucun administrateur n'existe encore. Créez le premier compte admin pour configurer la plateforme.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsBootstrapMode(true)}
                    >
                      Créer le premier Admin
                    </Button>
                  </motion.div>
                )}

                {!showBootstrap && (
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>L'inscription admin n'est pas disponible.</p>
                    <p>Contactez le support pour obtenir un accès.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-destructive opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--destructive)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--destructive)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-destructive-foreground">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-lg"
          >
            <h2 className="text-4xl font-bold mb-6">
              Panneau d'Administration
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Gérez l'ensemble de la plateforme éducative : utilisateurs, 
              classes, niveaux, matières et abonnements.
            </p>
            
            <div className="space-y-4">
              {[
                'Gestion des utilisateurs et rôles',
                'Configuration des niveaux et classes',
                'Suivi des abonnements',
                'Statistiques et rapports',
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
