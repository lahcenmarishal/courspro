import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CreditCard, Calendar, Users, TrendingUp, Search, CheckCircle, XCircle, Clock, GraduationCap, BookOpen, Star, Check, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { planLabels, planPrices, allPlans as sharedAllPlans } from "@/lib/plans";

// Plans tarifaires depuis la config partagée
interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  level: string;
  price: { monthly: number; annual: number };
  subjects: string[];
  features: string[];
  popular?: boolean;
  highlight?: boolean;
  color?: string;
}

const pricingPlans: { primaire: PricingPlan[]; college: PricingPlan[]; lycee: PricingPlan[]; particulier: PricingPlan[] } = {
  primaire: [
    {
      id: 'primaire',
      name: '6ème année primaire',
      subtitle: '6ème année primaire',
      level: 'primaire',
      price: { monthly: 150, annual: 500 },
      subjects: ['Arabe', 'Français', 'Mathématiques'],
      features: ['3 séances / semaine', '3h / séance', 'Suivi basique'],
      color: 'from-primary to-primary/80',
    }
  ],
  college: [
    {
      id: 'college-regional',
      name: 'Collège Pack Régional',
      subtitle: '3ème année collège - Toutes matières',
      level: 'college',
      price: { monthly: 300, annual: 1000 },
      subjects: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 'Anglais', 'Arabe'],
      features: ['6 séances / semaine', 'Exercices guidés + devoirs ciblés', 'Suivi basique'],
      popular: true,
      color: 'from-teal-600 to-teal-500',
    }
  ],
  lycee: [
    {
      id: 'lycee-1bac-jihawi',
      name: '1 Bac Pack Aljihawi',
      subtitle: '1ère Bac - Matières régional',
      level: 'lycee',
      price: { monthly: 250, annual: 1000 },
      subjects: ['Français', 'Géographie', 'Arabe', 'Éducation islamique'],
      features: ['4 séances / semaine', 'Exercices guidés + devoirs', 'Suivi basique'],
      color: 'from-cyan-600 to-cyan-500',
      popular: true,
    },
    {
      id: 'lycee-2bac-total',
      name: '2 Bac National Complet',
      subtitle: '2ème Bac - Toutes matières',
      level: 'lycee',
      price: { monthly: 350, annual: 1300 },
      subjects: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Anglais', 'Philosophie'],
      features: ['5 séances / semaine', 'DS + simulations complètes', 'Préparation complète au national'],
      popular: true,
      highlight: true,
      color: 'from-amber-600 to-amber-500',
    }
  ],
  particulier: [
    {
      id: 'particulier-suivi',
      name: 'Suivi individuel',
      subtitle: 'Cours particuliers',
      level: 'particulier',
      price: { monthly: 0, annual: 0 },
      subjects: ['Toutes matières'],
      features: ['Séance individuelle avec le prof', 'Programme personnalisé', 'Suivi personnel complet', 'Flexibilité des horaires'],
      popular: true,
    }
  ]
};

const allPlans: PricingPlan[] = [...pricingPlans.primaire, ...pricingPlans.college, ...pricingPlans.lycee];

interface Subscription {
  id: string;
  student_id: string;
  type: 'monthly' | 'annual';
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  start_date: string;
  end_date: string;
  price_paid: number;
  auto_renew: boolean;
  student?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Student {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function SubscriptionsPage() {
  const { user, role } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [newSubscription, setNewSubscription] = useState({
    student_id: '',
    type: 'monthly' as 'monthly' | 'annual',
    price_paid: 0,
    auto_renew: false,
  });

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      if (role === 'admin') {
        fetchStudents();
      }
    }
  }, [user, role]);

  const fetchSubscriptions = async () => {
    try {
      let query = supabase.from('subscriptions').select('*');
      
      if (role === 'student') {
        query = query.eq('student_id', user?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch student profiles for each subscription
      const subscriptionsWithStudents = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', sub.student_id)
            .single();

          return { ...sub, student: profile };
        })
      );

      setSubscriptions(subscriptionsWithStudents);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (studentRoles) {
        const studentIds = studentRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', studentIds);

        setStudents(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscription.student_id || newSubscription.price_paid <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      if (newSubscription.type === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const { error } = await supabase.from('subscriptions').insert({
        student_id: newSubscription.student_id,
        type: newSubscription.type,
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        price_paid: newSubscription.price_paid,
        auto_renew: newSubscription.auto_renew,
      });

      if (error) throw error;

      toast.success('Abonnement créé avec succès');
      setIsCreateOpen(false);
      setNewSubscription({ student_id: '', type: 'monthly', price_paid: 0, auto_renew: false });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error("Erreur lors de la création de l'abonnement");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'suspended' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Statut mis à jour');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Actif</Badge>;
      case 'expired':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20"><Clock className="h-3 w-3 mr-1" />Expiré</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Suspendu</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.student?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    monthly: subscriptions.filter(s => s.type === 'monthly' && s.status === 'active').length,
    annual: subscriptions.filter(s => s.type === 'annual' && s.status === 'active').length,
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Abonnements</h1>
              <p className="text-muted-foreground">
                {role === 'admin' ? 'Gérer les abonnements des élèves' : 'Gérer votre abonnement'}
              </p>
            </div>
            {role === 'admin' && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvel abonnement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un abonnement</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un pack et un élève pour créer un abonnement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Élève</Label>
                      <Select 
                        value={newSubscription.student_id} 
                        onValueChange={(v) => setNewSubscription({...newSubscription, student_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un élève" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.user_id} value={student.user_id}>
                              {student.first_name} {student.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Pack tarifaire</Label>
                      <div className="grid gap-3">
                        {allPlans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => {
                              setSelectedPlan(plan.id);
                              setNewSubscription({
                                ...newSubscription,
                                price_paid: newSubscription.type === 'monthly' ? plan.price.monthly : plan.price.annual
                              });
                            }}
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer transition-all",
                              selectedPlan === plan.id 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">{plan.name}</h4>
                                  {plan.popular && (
                                    <Badge className="bg-amber-500/10 text-amber-600 text-xs">
                                      <Star className="h-3 w-3 mr-1" />Populaire
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{plan.subjects.join(' | ')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{plan.price.monthly} DH<span className="text-xs font-normal">/mois</span></p>
                                <p className="text-xs text-muted-foreground">{plan.price.annual} DH/an</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Type de paiement</Label>
                      <Select 
                        value={newSubscription.type} 
                        onValueChange={(v: 'monthly' | 'annual') => {
                          const plan = allPlans.find(p => p.id === selectedPlan);
                          setNewSubscription({
                            ...newSubscription, 
                            type: v,
                            price_paid: plan ? (v === 'monthly' ? plan.price.monthly : plan.price.annual) : 0
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                          <SelectItem value="annual">Annuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Montant payé (DH)</Label>
                      <Input 
                        type="number" 
                        value={newSubscription.price_paid}
                        onChange={(e) => setNewSubscription({...newSubscription, price_paid: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreateSubscription}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats */}
          {role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total abonnements</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actifs</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mensuels</p>
                      <p className="text-2xl font-bold">{stats.monthly}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annuels</p>
                      <p className="text-2xl font-bold">{stats.annual}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <>
                <Card>
                  <CardContent className="p-8 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucun abonnement actif</h3>
                    <p className="text-muted-foreground mb-4">
                      {role === 'admin' ? 'Créez un nouvel abonnement pour commencer' : "Découvrez nos offres ci-dessous"}
                    </p>
                  </CardContent>
                </Card>

                {/* Available Plans for students/parents */}
                {role !== 'admin' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold">Programmes éducatifs</h2>
                    
                    {/* 3 cards layout matching screenshot */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Primaire Card */}
                      <Card className="overflow-hidden border-2 border-primary/20">
                        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Primaire</h3>
                          </div>
                          <p className="text-sm opacity-90">6ème année primaire</p>
                          <div className="mt-3">
                            <span className="text-3xl font-bold">150</span>
                            <span className="text-sm"> MAD/mois</span>
                            <span className="text-xs ml-2 opacity-80">• 500 DH/an</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Construire des bases solides avec un accompagnement bienveillant
                          </p>
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Matières enseignées</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">🌍 Arabe</Badge>
                              <Badge variant="outline" className="text-xs">FR Français</Badge>
                              <Badge variant="outline" className="text-xs">📐 Mathématiques</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              3 séances / semaine • 3h / séance
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Cours interactifs
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Collège Card */}
                      <Card className="overflow-hidden border-2 border-teal-500">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Collège Pack Régional</h3>
                          </div>
                          <p className="text-sm opacity-90">3ème année collège - Toutes matières</p>
                          <div className="mt-3">
                            <span className="text-3xl font-bold">300</span>
                            <span className="text-sm"> MAD/mois</span>
                            <span className="text-xs ml-2 opacity-80">• 1000 DH/an</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Préparer l'excellence avec autonomie pour le brevet
                          </p>
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Matières enseignées</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">📐 Mathématiques</Badge>
                              <Badge variant="outline" className="text-xs">FR Français</Badge>
                              <Badge variant="outline" className="text-xs">🔬 Physique-Chimie</Badge>
                              <Badge variant="outline" className="text-xs">🌿 SVT</Badge>
                              <Badge variant="outline" className="text-xs">GB Anglais</Badge>
                              <Badge variant="outline" className="text-xs">🌍 Arabe</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              6 séances / semaine
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Cours interactifs
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              95% taux de réussite au Brevet
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lycée Card */}
                      <Card className="overflow-hidden border-2 border-amber-500">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Lycée</h3>
                          </div>
                          <p className="text-sm opacity-90">1ère & 2ème année BAC</p>
                          <div className="mt-3">
                            <span className="text-3xl font-bold">250–350</span>
                            <span className="text-sm"> MAD/mois</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Objectif Baccalauréat avec préparation intensive
                          </p>
                          
                          {/* Pack Jihawi */}
                          <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 mb-2">
                            <p className="font-semibold text-sm text-cyan-700 dark:text-cyan-400">1 Bac Pack Aljihawi</p>
                            <p className="text-xs text-muted-foreground">Français | Géographie | Arabe | Éducation islamique</p>
                            <p className="text-xs font-semibold text-cyan-600">250 MAD/mois • 1000 DH/an</p>
                          </div>
                          
                          {/* Pack Total Watani */}
                          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600">
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">2 Bac National Complet</p>
                              <Star className="h-3 w-3 text-amber-500" />
                            </div>
                            <p className="text-xs text-muted-foreground">Mathématiques | Physique-Chimie | SVT | Anglais | Philosophie</p>
                            <p className="text-xs font-semibold text-amber-600">350 MAD/mois • 1300 DH/an</p>
                          </div>


                          <div className="mt-3 p-2 rounded bg-muted/50 text-xs text-muted-foreground text-center">
                            100 DH / mois pour une seule matière
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cours particuliers */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-indigo-600" />
                        Cours particuliers — Sans pack
                      </h3>
                      <div className="max-w-md">
                        <Card className="border-indigo-500">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">Suivi individuel</CardTitle>
                                <CardDescription>Cours particuliers</CardDescription>
                              </div>
                              <Badge className="bg-indigo-500/10 text-indigo-600">
                                <Star className="h-3 w-3 mr-1" />Recommandé
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 mb-4">
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-indigo-600" />
                                Séance individuelle avec le prof
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-indigo-600" />
                                Programme personnalisé
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-indigo-600" />
                                Suivi personnel complet
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-indigo-600" />
                                Flexibilité des horaires
                              </li>
                            </ul>
                            <Button className="w-full" asChild>
                              <Link to="/contact">Demander un support</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              filteredSubscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {subscription.student?.first_name} {subscription.student?.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{subscription.student?.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <Badge variant="outline" className="capitalize">
                            {subscription.type === 'monthly' ? 'Mensuel' : 'Annuel'}
                          </Badge>
                          {getStatusBadge(subscription.status)}
                          <div className="text-right">
                            <p className="font-semibold">{subscription.price_paid} DH</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(subscription.start_date), 'dd MMM yyyy', { locale: fr })} - {format(new Date(subscription.end_date), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          {role === 'admin' && subscription.status === 'active' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateStatus(subscription.id, 'suspended')}
                              >
                                Suspendre
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleUpdateStatus(subscription.id, 'cancelled')}
                              >
                                Annuler
                              </Button>
                            </div>
                          )}
                          {role === 'admin' && subscription.status === 'suspended' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(subscription.id, 'active')}
                            >
                              Réactiver
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
