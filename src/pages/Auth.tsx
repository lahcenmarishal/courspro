import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, User, ArrowLeft, Loader2, Check, Star, BookOpen, Clock, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import studentsHeroImage from '@/assets/students-hero-auth.jpg';

type AppRole = 'admin' | 'teacher' | 'student';

// Packs par niveau
const primaireCollegePlans = [
  {
    id: 'primaire',
    name: "6ème année primaire",
    nameAr: "السنة السادسة ابتدائي",
    level: "Primaire",
    levelAr: "الابتدائي",
    price: { monthly: 100, annual: 500 },
    subjects: "Arabe | Français | Math",
    subjectsAr: "العربية | الفرنسية | الرياضيات",
    features: [
      "3 séances / semaine",
      "3h / séance",
      "Suivi basique"
    ],
    featuresAr: [
      "3 حصص / أسبوع",
      "3 ساعات / حصة",
      "متابعة أساسية"
    ],
    color: "from-primary to-primary/80",
    textColor: "text-primary",
    borderColor: "border-primary",
    bgColor: "bg-primary"
  },
  {
    id: 'college',
    name: "3ème année collège",
    nameAr: "السنة الثالثة إعدادي",
    level: "Collège",
    levelAr: "الإعدادي",
    price: { monthly: 150, annual: 700 },
    subjects: "Math | FR | PC | SVT | Anglais",
    subjectsAr: "رياضيات | فرنسية | فيزياء | علوم | إنجليزية",
    features: [
      "5 séances / semaine",
      "Mini-groupe",
      "Exercices guidés"
    ],
    featuresAr: [
      "5 حصص / أسبوع",
      "مجموعة صغيرة",
      "تمارين موجهة"
    ],
    color: "from-emerald-600 to-emerald-500",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-600"
  }
];

const lyceePlans = [
  {
    id: 'lycee-jihawi',
    name: "1er année BAC",
    nameAr: "السنة الأولى باك",
    level: "Lycée",
    levelAr: "الثانوي",
    subtitle: "Pack Jihawi",
    subtitleAr: "باقة الجهوي",
    price: { monthly: 200, annual: 900 },
    subjects: "Français | Arabe | Éducation islamique | GEO",
    subjectsAr: "الفرنسية | العربية | التربية الإسلامية | الجغرافيا",
    features: [
      "3h / séance, mini-groupe",
      "Fiches méthodes + corrections détaillées",
      "Suivi structuré : bilan hebdo + rapport parent"
    ],
    featuresAr: [
      "3 ساعات / حصة، مجموعة صغيرة",
      "أوراق منهجية + تصحيحات مفصلة",
      "متابعة منظمة: تقرير أسبوعي + تقرير للأولياء"
    ],
    option: "100DH / matière (Au choix d'une seule matière)",
    optionAr: "100 درهم / مادة (باختيار مادة واحدة)",
    color: "from-blue-600 to-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-600"
  },
  {
    id: 'lycee-essentiel',
    name: "2ème année BAC",
    nameAr: "السنة الثانية باك",
    level: "Lycée",
    levelAr: "الثانوي",
    subtitle: "Pack Essentiel",
    subtitleAr: "الباقة الأساسية",
    price: { monthly: 250, annual: 1200 },
    subjects: "Math | Physique chimie | SVT",
    subjectsAr: "رياضيات | فيزياء كيمياء | علوم الحياة والأرض",
    features: [
      "6h / semaine",
      "Devoirs surveillés + simulations de contrôles",
      "Suivi premium : bilan hebdo, call parent mensuel",
      "Accès prioritaire aux ateliers & banques d'exercices"
    ],
    featuresAr: [
      "6 ساعات / أسبوع",
      "فروض محروسة + محاكاة للامتحانات",
      "متابعة متميزة: تقرير أسبوعي، اتصال شهري بالأولياء",
      "أولوية الوصول للورشات وبنوك التمارين"
    ],
    option: "100 dh / matière (au choix d'une seule séance)",
    optionAr: "100 درهم / مادة (باختيار حصة واحدة)",
    color: "from-purple-600 to-purple-500",
    textColor: "text-purple-600",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-600"
  },
  {
    id: 'lycee-total',
    name: "2ème année BAC",
    nameAr: "السنة الثانية باك",
    level: "Lycée",
    levelAr: "الثانوي",
    subtitle: "Pack Total Watani",
    subtitleAr: "باقة الوطني الكاملة",
    price: { monthly: 350, annual: 1500 },
    subjects: "Math | PC | SVT | Anglais | Philosophie",
    subjectsAr: "رياضيات | فيزياء | علوم | إنجليزية | فلسفة",
    features: [
      "8h / semaine",
      "Devoirs surveillés + simulations de contrôles",
      "Suivi premium : bilan hebdo, call parent mensuel",
      "Accès prioritaire aux ateliers & banques d'exercices"
    ],
    featuresAr: [
      "8 ساعات / أسبوع",
      "فروض محروسة + محاكاة للامتحانات",
      "متابعة متميزة: تقرير أسبوعي، اتصال شهري بالأولياء",
      "أولوية الوصول للورشات وبنوك التمارين"
    ],
    option: "100dh / matière (au choix d'une seule séance)",
    optionAr: "100 درهم / مادة (باختيار حصة واحدة)",
    color: "from-amber-600 to-amber-500",
    textColor: "text-amber-600",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-600",
    popular: true
  }
];

const allPlans = [...primaireCollegePlans, ...lyceePlans];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'none' | 'pending' | 'rejected'>('none');
  
  const { signIn, signUp, user } = useAuth();
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMinLength')),
  });

  const signupSchema = loginSchema.extend({
    firstName: z.string().min(2, t('auth.firstNameMinLength')),
    lastName: z.string().min(2, t('auth.lastNameMinLength')),
  });

  // Check student status after login
  useEffect(() => {
    if (user) {
      const checkStatus = async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('status, role')
          .eq('user_id', user.id)
          .single();
        
        if (data?.role === 'student' && data?.status === 'pending') {
          await supabase.auth.signOut();
          setAccountStatus('pending');
        } else if (data?.role === 'student' && data?.status === 'rejected') {
          await supabase.auth.signOut();
          setAccountStatus('rejected');
        } else {
          navigate('/dashboard');
        }
      };
      checkStatus();
    }
  }, [user, navigate]);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      if (plan === 'lycee') {
        setSelectedPlan('lycee-total');
        setIsLogin(false);
      } else if (allPlans.find(p => p.id === plan)) {
        setSelectedPlan(plan);
        setIsLogin(false);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('auth.invalidCredentials'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('auth.loginSuccess'));
          navigate('/dashboard');
        }
      } else {
        const validation = signupSchema.safeParse({ 
          email, 
          password, 
          firstName, 
          lastName
        });
        
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName, 'student');
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(t('auth.emailAlreadyUsed'));
          } else {
            toast.error(error.message);
          }
        } else {
          // Update profile with city if provided
          if (city.trim()) {
            // We need to get the user id - since student is signed out, use a workaround
            // The profile is created by trigger, city will be updated by admin or later
          }
          setRegistrationSuccess(true);
          toast.success(isArabic ? 'تم إرسال طلبك بنجاح! في انتظار التفعيل.' : 'Demande envoyée ! En attente d\'activation par l\'administrateur.');
        }
      }
    } catch (error) {
      toast.error(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Check student status on login
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('status, role')
      .eq('user_id', user?.id || '')
      .single();

    if (roleData?.role === 'student' && roleData?.status === 'pending') {
      await supabase.auth.signOut();
      setAccountStatus('pending');
      toast.error(isArabic ? 'حسابك في انتظار التفعيل' : 'Votre compte est en attente d\'activation');
      return;
    }
  };




  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setIsLogin(false);
  };

  if (registrationSuccess || accountStatus === 'pending') {
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
          <h1 className="text-2xl font-bold mb-3">
            {isArabic ? 'في انتظار التفعيل' : 'En attente d\'activation'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isArabic 
              ? 'تم إرسال طلب تسجيلك بنجاح. سيقوم المسؤول بتفعيل حسابك قريباً.'
              : 'Votre inscription a été envoyée avec succès. Un administrateur activera votre compte prochainement.'}
          </p>
          <div className="bg-yellow-500/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{isArabic ? 'ستتلقى إشعاراً عند تفعيل حسابك.' : 'Vous serez notifié une fois votre compte activé.'}</span>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isArabic ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
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
          <h1 className="text-2xl font-bold mb-3">
            {isArabic ? 'تم رفض الطلب' : 'Demande rejetée'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isArabic 
              ? 'للأسف، تم رفض طلب تسجيلك. يرجى التواصل مع الإدارة.'
              : 'Votre demande d\'inscription a été rejetée. Veuillez contacter l\'administration.'}
          </p>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isArabic ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-0">
        <img 
          src={studentsHeroImage} 
          alt="Élèves collaborant" 
          className="w-full h-full object-cover"
        />
        <div className={cn(
          "absolute inset-0 transition-all duration-500",
          "bg-gradient-to-b from-background/80 via-background/70 to-background/95"
        )} />
      </div>
    <div className="min-h-screen relative z-10" dir={dir}>
      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          {t('auth.backHome')}
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">
              {isLogin ? t('auth.login') : t('auth.signup')}
            </h1>
          </div>
          
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-emerald-500/10 border border-primary/20"
            >
              <p className="text-xl font-semibold text-foreground mb-2">
                {t('auth.inspiringTitle')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('auth.inspiringText')}
                <span className="font-medium text-foreground">{t('auth.inspiringHighlight')}</span>
              </p>
              <p className="mt-3 text-sm font-medium text-primary">
                {t('auth.inspiringWelcome')}
              </p>
            </motion.div>
          )}

          <p className="text-foreground/70 font-medium max-w-md mx-auto">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </motion.div>

        {!isLogin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 space-y-12"
          >
            <div>
              <h2 className="text-xl font-semibold text-center mb-6">
                <BookOpen className="inline-block h-5 w-5 mr-2" />
                {t('auth.primaireCollege')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {primaireCollegePlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="relative"
                  >
                    <Card 
                      className={cn(
                        "h-full cursor-pointer transition-all duration-300 hover:shadow-lg",
                        selectedPlan === plan.id 
                          ? `${plan.borderColor} border-2 shadow-lg scale-[1.02]` 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", plan.color)}>
                        <CardTitle className="text-center">
                          <span className="text-xs font-medium opacity-80">{isArabic ? plan.levelAr : plan.level}</span>
                          <p className="text-lg font-bold mt-1">{isArabic ? plan.nameAr : plan.name}</p>
                        </CardTitle>
                        <div className="text-center mt-3">
                          <span className="text-3xl font-bold">{plan.price.monthly}</span>
                          <span className="text-sm">MAD/{isArabic ? 'شهر' : 'mois'}</span>
                          <p className="text-xs opacity-80 mt-1">{plan.price.annual} DH/{isArabic ? 'سنة' : 'an'}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className={cn("text-center font-medium text-sm mb-3", plan.textColor)}>
                          {isArabic ? plan.subjectsAr : plan.subjects}
                        </p>
                        <ul className="space-y-2">
                          {(isArabic ? plan.featuresAr : plan.features).map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <Check className={cn("h-4 w-4 flex-shrink-0", plan.textColor)} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {selectedPlan === plan.id && (
                          <div className={cn("mt-4 text-center text-sm font-medium", plan.textColor)}>
                            {t('auth.selected')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-center mb-6">
                <GraduationCap className="inline-block h-5 w-5 mr-2" />
                {t('auth.lyceePacks')}
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {lyceePlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={cn("relative", plan.popular && "md:scale-105 z-10")}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                          <Star className="h-3 w-3" /> {t('auth.popular')}
                        </span>
                      </div>
                    )}
                    <Card 
                      className={cn(
                        "h-full cursor-pointer transition-all duration-300 hover:shadow-lg",
                        selectedPlan === plan.id 
                          ? `${plan.borderColor} border-2 shadow-lg scale-[1.02]` 
                          : "border-border hover:border-muted-foreground/50",
                        plan.popular && "shadow-xl"
                      )}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", plan.color)}>
                        <CardTitle className="text-center">
                          <span className="text-xs font-medium opacity-80">{isArabic ? plan.levelAr : plan.level}</span>
                          <p className="text-lg font-bold mt-1">{isArabic ? plan.nameAr : plan.name}</p>
                          <p className="text-sm opacity-90 mt-1">{isArabic ? plan.subtitleAr : plan.subtitle}</p>
                        </CardTitle>
                        <div className="text-center mt-3">
                          <span className="text-3xl font-bold">{plan.price.monthly}</span>
                          <span className="text-sm">MAD/{isArabic ? 'شهر' : 'mois'}</span>
                          <p className="text-xs opacity-80 mt-1">{plan.price.annual} DH/{isArabic ? 'سنة' : 'an'}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className={cn("text-center font-medium text-sm mb-3", plan.textColor)}>
                          {isArabic ? plan.subjectsAr : plan.subjects}
                        </p>
                        <ul className="space-y-2">
                          {(isArabic ? plan.featuresAr : plan.features).map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm">
                              <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", plan.textColor)} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {plan.option && (
                          <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t">
                            {isArabic ? plan.optionAr : plan.option}
                          </p>
                        )}
                        {selectedPlan === plan.id && (
                          <div className={cn("mt-4 text-center text-sm font-medium", plan.textColor)}>
                            {t('auth.selected')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={isArabic ? "أحمد" : "Jean"}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={isArabic ? "محمد" : "Dupont"}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{isArabic ? 'المدينة' : 'Ville'}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={isArabic ? "الدار البيضاء" : "Casablanca"}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isArabic ? "أنت@مثال.com" : "vous@example.com"}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
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


                {!isLogin && selectedPlan && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <span className="font-medium">{t('auth.selectedPack')}</span>
                    {isArabic 
                      ? (allPlans.find(p => p.id === selectedPlan) as any)?.nameAr 
                      : allPlans.find(p => p.id === selectedPlan)?.name}
                    {'subtitle' in (allPlans.find(p => p.id === selectedPlan) || {}) && (
                      <span className="text-muted-foreground"> - {isArabic 
                        ? (allPlans.find(p => p.id === selectedPlan) as any)?.subtitleAr 
                        : (allPlans.find(p => p.id === selectedPlan) as any)?.subtitle}</span>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? t('auth.loginBtn') : t('auth.signupBtn')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
}