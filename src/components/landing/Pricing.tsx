import { motion } from "framer-motion";
import { Check, ArrowRight, Star, BookOpen, Users, GraduationCap, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

interface LevelCardProps {
  level: {
    name: string;
    subtitle: string;
    price: { monthly: number; annual: number };
    subjects: string;
    features: string[];
    option: string;
    color: string;
    borderColor: string;
    textColor: string;
    icon: React.ElementType;
    link: string;
    plan: string;
    popular?: boolean;
  };
  index: number;
  chooseText: string;
  perMonthText: string;
  perYearText: string;
  seeDetailsText: string;
  popularText: string;
}

const LevelCard = ({ level, index, chooseText, perMonthText, perYearText, seeDetailsText, popularText }: LevelCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={cn("h-full relative", level.popular && "scale-105 z-10")}
  >
    {level.popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
          <Star className="h-3 w-3" /> {popularText}
        </span>
      </div>
    )}
    <Card className={cn(
      "h-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
      level.popular ? "border-2" : "",
      level.borderColor
    )}>
      <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", level.color)}>
        <div className="flex items-center justify-center mb-2">
          <level.icon className="h-10 w-10 opacity-90" />
        </div>
        <CardTitle className="text-center">
          <span className="text-2xl font-bold">{level.name}</span>
          <p className="text-sm opacity-90 mt-1">{level.subtitle}</p>
        </CardTitle>
        <div className="text-center mt-4">
          <span className="text-5xl font-bold">{level.price.monthly}</span>
          <span className="text-xl">{perMonthText}</span>
          <p className="text-sm opacity-80 mt-1">{level.price.annual} DH {perYearText}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className={cn("text-center font-medium mb-4 text-sm", level.textColor)}>
          {level.subjects}
        </p>
        <ul className="space-y-3 mb-4">
          {level.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", level.textColor)} />
              {feature}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground text-center mb-4">
          {level.option}
        </p>
        <div className="space-y-2">
          <Button 
            className={cn("w-full", level.popular && "bg-amber-600 hover:bg-amber-700")} 
            size="lg" 
            asChild
          >
            <Link to={`/auth?plan=${level.plan}`}>{chooseText}</Link>
          </Button>
          <Button variant="ghost" className="w-full" size="sm" asChild>
            <Link to={level.link}>
              {seeDetailsText} <ArrowRight className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const Pricing = () => {
  const { t, language } = useLanguage();

  const levels = [
    {
      name: language === 'ar' ? "إعدادي - الجهوي" : "Collège Pack Régional",
      subtitle: language === 'ar' ? "الثالثة إعدادي - جميع المواد" : "3ème année collège - Toutes matières",
      price: { monthly: 300, annual: 1000 },
      subjects: language === 'ar' ? "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض | الفرنسية | الإنجليزية | العربية" : "Mathématiques | Physique-Chimie | SVT | Français | Anglais | Arabe",
      features: language === 'ar' ? [
        "6 حصص / أسبوع",
        "تمارين موجهة + واجبات محددة",
        "متابعة أساسية طول فترة الاشتراك"
      ] : [
        "6 séances / semaine",
        "Exercices guidés + devoirs ciblés",
        "Suivi basique tout au long de l'abonnement"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-teal-600 to-teal-500",
      borderColor: "border-teal-500",
      textColor: "text-teal-600",
      icon: Users,
      link: "/programmes/college",
      plan: "college-regional",
      popular: true
    },
    {
      name: language === 'ar' ? "1 باك الجهوي" : "1 Bac Pack Aljihawi",
      subtitle: language === 'ar' ? "الأولى باك - مواد الامتحان الجهوي" : "1ère Bac - Matières régional",
      price: { monthly: 250, annual: 1000 },
      subjects: language === 'ar' ? "الفرنسية | الجغرافيا | العربية | التربية الإسلامية" : "Français | Géographie | Arabe | Éducation islamique",
      features: language === 'ar' ? [
        "4 حصص / أسبوع",
        "تمارين موجهة + فروض",
        "متابعة أساسية طول فترة الاشتراك"
      ] : [
        "4 séances / semaine",
        "Exercices guidés + devoirs",
        "Suivi basique tout au long de l'abonnement"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-cyan-600 to-cyan-500",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-600",
      icon: GraduationCap,
      link: "/programmes/lycee/1bac-jihawi",
      plan: "lycee-1bac-jihawi",
      popular: true
    },
    {
      name: language === 'ar' ? "2 باك الوطني الكامل" : "2 Bac National Complet",
      subtitle: language === 'ar' ? "الثانية باك - جميع المواد" : "2ème Bac - Toutes matières",
      price: { monthly: 350, annual: 1300 },
      subjects: language === 'ar' ? "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض | الإنجليزية | الفلسفة" : "Mathématiques | Physique-Chimie | SVT | Anglais | Philosophie",
      features: language === 'ar' ? [
        "5 حصص / أسبوع",
        "فروض مراقبة + محاكاة كاملة",
        "متابعة أساسية طول فترة الاشتراك",
        "تحضير شامل للامتحان الوطني"
      ] : [
        "5 séances / semaine",
        "DS + simulations complètes",
        "Suivi basique tout au long de l'abonnement",
        "Préparation complète au national"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-amber-600 to-amber-500",
      borderColor: "border-amber-500",
      textColor: "text-amber-600",
      icon: GraduationCap,
      link: "/programmes/lycee/2bac-total",
      plan: "lycee-2bac-total",
      popular: true
    },
    {
      name: language === 'ar' ? "الابتدائي" : "Primaire",
      subtitle: language === 'ar' ? "السنة السادسة ابتدائي" : "6ème année primaire",
      price: { monthly: 150, annual: 500 },
      subjects: language === 'ar' ? "العربية | الفرنسية | الرياضيات" : "Arabe | Français | Mathématiques",
      features: language === 'ar' ? [
        "3 حصص / أسبوع",
        "3 ساعات / حصة",
        "متابعة أساسية طول فترة الاشتراك"
      ] : [
        "3 séances / semaine",
        "3 heures / séance",
        "Suivi basique tout au long de l'abonnement"
      ],
      option: language === 'ar' ? "70 درهم / شهر للمادة الواحدة" : "70 DH / mois pour une seule matière",
      color: "from-primary to-primary/80",
      borderColor: "border-primary",
      textColor: "text-primary",
      icon: BookOpen,
      link: "/programmes/primaire",
      plan: "primaire"
    },
    {
      name: language === 'ar' ? "إعدادي - الأساسي" : "Collège 3AC Essentiel",
      subtitle: language === 'ar' ? "الثالثة إعدادي - المواد الأساسية" : "3ème année collège - Pack essentiel",
      price: { monthly: 200, annual: 700 },
      subjects: language === 'ar' ? "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض | الفرنسية | العربية | التربية الإسلامية" : "Toutes matières",
      features: language === 'ar' ? [
        "4 حصص / أسبوع",
        "تمارين موجهة + واجبات محددة",
        "متابعة أساسية طول فترة الاشتراك"
      ] : [
        "4 séances / semaine",
        "Exercices guidés + devoirs ciblés",
        "Suivi basique tout au long de l'abonnement"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-emerald-600 to-emerald-500",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-600",
      icon: Users,
      link: "/programmes/college",
      plan: "college-essentiel"
    },
    {
      name: language === 'ar' ? "1 باك" : "1 Bac",
      subtitle: language === 'ar' ? "السنة الأولى باكالوريا" : "1ère année Bac",
      price: { monthly: 350, annual: 1000 },
      subjects: language === 'ar' ? "جميع المواد" : "Toutes matières",
      features: language === 'ar' ? [
        "7 حصص / أسبوع",
        "تمارين موجهة + فروض",
        "متابعة أساسية طول فترة الاشتراك"
      ] : [
        "7 séances / semaine",
        "Exercices guidés + devoirs",
        "Suivi basique tout au long de l'abonnement"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-blue-600 to-blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      icon: GraduationCap,
      link: "/programmes/lycee/1bac",
      plan: "lycee-1bac"
    },
    {
      name: language === 'ar' ? "2 باك أساسي" : "2 Bac Essentiel",
      subtitle: language === 'ar' ? "الثانية باك - المواد الأساسية" : "2ème Bac - Matières principales",
      price: { monthly: 250, annual: 1000 },
      subjects: language === 'ar' ? "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض" : "Mathématiques | Physique-Chimie | SVT",
      features: language === 'ar' ? [
        "3 حصص / أسبوع",
        "فروض مراقبة + محاكاة",
        "متابعة أساسية طول فترة الاشتراك",
        "تحضير مكثف للامتحان الوطني"
      ] : [
        "3 séances / semaine",
        "Devoirs surveillés + simulations",
        "Suivi basique tout au long de l'abonnement",
        "Préparation intensive au national"
      ],
      option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
      color: "from-purple-600 to-purple-500",
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
      icon: GraduationCap,
      link: "/programmes/lycee/2bac-essentiel",
      plan: "lycee-2bac-essentiel"
    }
  ];

  const individualOptions = [
    {
      name: language === 'ar' ? "متابعة فردية" : "Suivi individuel",
      subtitle: language === 'ar' ? "حصص خاصة" : "Cours particuliers",
      features: language === 'ar' ? [
        "حصة فردية مع الأستاذ",
        "برنامج مخصص",
        "متابعة شخصية كاملة",
        "مرونة في المواعيد"
      ] : [
        "Séance individuelle avec le prof",
        "Programme personnalisé",
        "Suivi personnel complet",
        "Flexibilité des horaires"
      ],
      color: "from-indigo-600 to-indigo-500",
      borderColor: "border-indigo-500",
      textColor: "text-indigo-600",
      icon: UserRound,
      popular: true,
      plan: "particulier-suivi",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            <Star className="h-4 w-4" />
            {t("pricing.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t("pricing.title")}{" "}
            <span className="gradient-text">{t("pricing.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? "اختر المستوى الذي يناسب طفلك واستفد من تعليم عالي الجودة"
              : "Choisissez le niveau qui correspond à votre enfant et bénéficiez d'un enseignement de qualité"
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {levels.map((level, index) => (
            <LevelCard
              key={level.name + level.plan}
              level={level}
              index={index}
              chooseText={language === 'ar' ? "للاستفادة من هذه الباقة" : "Bénéficier de ce pack"}
              perMonthText={language === 'ar' ? " درهم/شهر" : " DH/mois"}
              perYearText={t("pricing.perYear")}
              seeDetailsText={language === 'ar' ? "عرض التفاصيل" : "Voir les détails"}
              popularText={language === 'ar' ? "الأكثر طلباً" : "Populaire"}
            />
          ))}
        </div>

        {/* Individual / Particulier options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            <UserRound className="inline-block h-6 w-6 mr-2" />
            {language === 'ar' ? 'حصص خاصة - بدون باقة' : 'Cours particuliers — Sans pack'}
          </h3>
          <div className="flex justify-center max-w-md mx-auto">
            {individualOptions.map((opt, index) => (
              <motion.div
                key={opt.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn("relative", opt.popular && "scale-105 z-10")}
              >
                {opt.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full">
                      <Star className="h-3 w-3" /> {language === 'ar' ? 'الأكثر طلباً' : 'Recommandé'}
                    </span>
                  </div>
                )}
                <Card className={cn(
                  "h-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
                  opt.popular ? "border-2" : "",
                  opt.borderColor
                )}>
                  <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", opt.color)}>
                    <div className="flex items-center justify-center mb-2">
                      <opt.icon className="h-10 w-10 opacity-90" />
                    </div>
                    <CardTitle className="text-center">
                      <span className="text-2xl font-bold">{opt.name}</span>
                      <p className="text-sm opacity-90 mt-1">{opt.subtitle}</p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3 mb-4">
                      {opt.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", opt.textColor)} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/auth?plan=${opt.plan}`}>{language === 'ar' ? "طلب الدعم" : "Demander un support"}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto"
        >
          {t("pricing.note")}
        </motion.p>
      </div>
    </section>
  );
};
