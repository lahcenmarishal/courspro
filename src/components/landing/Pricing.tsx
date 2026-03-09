import { motion } from "framer-motion";
import { Check, ArrowRight, Star, BookOpen, Users, GraduationCap, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { primaireCollegePlans, lyceePlans, individualPlans, type PlanConfig } from "@/lib/plans";

const iconMap: Record<string, React.ElementType> = {
  'primaire': BookOpen,
  'college-regional': Users,
  'lycee-1bac-jihawi': GraduationCap,
  'lycee-2bac-total': GraduationCap,
};

const linkMap: Record<string, string> = {
  'primaire': '/programmes#primaire',
  'college-regional': '/programmes#college',
  'lycee-1bac-jihawi': '/programmes#lycee',
  'lycee-2bac-total': '/programmes#lycee',
};

interface LevelCardProps {
  plan: PlanConfig;
  index: number;
  language: string;
  icon: React.ElementType;
  link: string;
}

const LevelCard = ({ plan, index, language, icon: Icon, link }: LevelCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={cn("h-full relative", plan.popular && "scale-105 z-10")}
  >
    {plan.popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
          <Star className="h-3 w-3" /> {language === 'ar' ? 'الأكثر طلباً' : 'Populaire'}
        </span>
      </div>
    )}
    <Card className={cn(
      "h-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
      plan.popular ? "border-2" : "",
      plan.borderColor
    )}>
      <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", plan.color)}>
        <div className="flex items-center justify-center mb-2">
          <Icon className="h-10 w-10 opacity-90" />
        </div>
        <CardTitle className="text-center">
          <span className="text-2xl font-bold">{language === 'ar' ? plan.nameAr : plan.name}</span>
          <p className="text-sm opacity-90 mt-1">{language === 'ar' ? plan.subtitleAr : plan.subtitle}</p>
        </CardTitle>
        <div className="text-center mt-4">
          <span className="text-5xl font-bold">{plan.price.monthly}</span>
          <span className="text-xl">{language === 'ar' ? ' درهم/شهر' : ' DH/mois'}</span>
          <p className="text-sm opacity-80 mt-1">{plan.price.annual} DH {language === 'ar' ? '/ سنة' : '/ an'}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className={cn("text-center font-medium mb-4 text-sm", plan.textColor)}>
          {language === 'ar' ? plan.subjectsAr : plan.subjects}
        </p>
        <ul className="space-y-3 mb-4">
          {(language === 'ar' ? plan.featuresAr : plan.features).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", plan.textColor)} />
              {feature}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground text-center mb-4">
          {language === 'ar' ? plan.optionAr : plan.option}
        </p>
        <div className="space-y-2">
          <Button 
            className={cn("w-full", plan.popular && "bg-amber-600 hover:bg-amber-700")} 
            size="lg" 
            asChild
          >
            <Link to={`/auth?plan=${plan.id}`}>{language === 'ar' ? 'للاستفادة من هذه الباقة' : 'Bénéficier de ce pack'}</Link>
          </Button>
          <Button variant="ghost" className="w-full" size="sm" asChild>
            <Link to={link}>
              {language === 'ar' ? 'عرض التفاصيل' : 'Voir les détails'} <ArrowRight className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const Pricing = () => {
  const { t, language } = useLanguage();

  const allPlans = [...primaireCollegePlans, ...lyceePlans];
  const individuelPlan = individualPlans[0];

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
          {allPlans.map((plan, index) => (
            <LevelCard
              key={plan.id}
              plan={plan}
              index={index}
              language={language}
              icon={iconMap[plan.id] || GraduationCap}
              link={linkMap[plan.id] || '/programmes'}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative scale-105 z-10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full">
                  <Star className="h-3 w-3" /> {language === 'ar' ? 'الأكثر طلباً' : 'Recommandé'}
                </span>
              </div>
              <Card className={cn("h-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2", individuelPlan.borderColor)}>
                <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", individuelPlan.color)}>
                  <div className="flex items-center justify-center mb-2">
                    <UserRound className="h-10 w-10 opacity-90" />
                  </div>
                  <CardTitle className="text-center">
                    <span className="text-2xl font-bold">{language === 'ar' ? individuelPlan.nameAr : individuelPlan.name}</span>
                    <p className="text-sm opacity-90 mt-1">{language === 'ar' ? individuelPlan.subtitleAr : individuelPlan.subtitle}</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3 mb-4">
                    {(language === 'ar' ? individuelPlan.featuresAr : individuelPlan.features).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/auth?plan=particulier-suivi">{language === 'ar' ? 'طلب الدعم' : 'Demander un support'}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
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
