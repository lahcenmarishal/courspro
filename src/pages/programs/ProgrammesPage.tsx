import { motion } from "framer-motion";
import { Check, BookOpen, GraduationCap, ArrowRight, Star, Users, Clock, Award, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { primaireCollegePlans, lyceePlans, individualPlans } from "@/lib/plans";

const ProgrammesPage = () => {
  const { t, language } = useLanguage();

  const primairePlan = primaireCollegePlans.find(p => p.id === 'primaire')!;
  const collegePlan = primaireCollegePlans.find(p => p.id === 'college-regional')!;
  const lyceePlansList = lyceePlans;
  const individuelPlan = individualPlans[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              {language === 'ar' ? 'برامجنا التعليمية' : 'Nos Programmes'}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {language === 'ar' ? 'برامج تعليمية ' : 'Programmes '}
              <span className="gradient-text">{language === 'ar' ? 'متكاملة' : 'Éducatifs'}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'اختر المستوى الذي يناسب طفلك واستفد من تعليم عالي الجودة'
                : "Choisissez le niveau qui correspond à votre enfant et bénéficiez d'un enseignement de qualité"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">
                  {language === 'ar' ? 'سجل الآن' : "S'inscrire maintenant"} <ArrowRight className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{language === 'ar' ? 'اتصل بنا' : 'Nous contacter'}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Primaire */}
      <section id="primaire" className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            <BookOpen className="inline-block h-8 w-8 mr-2 text-primary" />
            {language === 'ar' ? 'الابتدائي' : 'Primaire'}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <Card className="border-primary shadow-xl">
              <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", primairePlan.color)}>
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold">{language === 'ar' ? primairePlan.nameAr : primairePlan.name}</span>
                  <p className="text-sm opacity-90 mt-1">{language === 'ar' ? primairePlan.subtitleAr : primairePlan.subtitle}</p>
                </CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">{primairePlan.price.monthly}</span>
                  <span className="text-xl">{language === 'ar' ? ' درهم/شهر' : ' MAD/mois'}</span>
                  <p className="text-sm opacity-80 mt-1">{primairePlan.price.annual} DH {language === 'ar' ? '/ سنة' : '/ an'}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-medium text-primary mb-4">
                  {language === 'ar' ? primairePlan.subjectsAr : primairePlan.subjects}
                </p>
                <ul className="space-y-3">
                  {(language === 'ar' ? primairePlan.featuresAr : primairePlan.features).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {language === 'ar' ? primairePlan.optionAr : primairePlan.option}
                </p>
                <Button className="w-full mt-6" size="lg" asChild>
                  <Link to="/auth?plan=primaire">{language === 'ar' ? 'اختر هذا الباك' : 'Choisir ce pack'}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Collège */}
      <section id="college" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            <GraduationCap className="inline-block h-8 w-8 mr-2 text-teal-600" />
            {language === 'ar' ? 'الإعدادي' : 'Collège'}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <Card className={cn("shadow-xl border-2", collegePlan.borderColor)}>
              {collegePlan.popular && (
                <div className="flex justify-center -mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    <Star className="h-3 w-3" /> {language === 'ar' ? 'الأكثر طلباً' : 'Populaire'}
                  </span>
                </div>
              )}
              <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", collegePlan.color)}>
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold">{language === 'ar' ? collegePlan.nameAr : collegePlan.name}</span>
                  <p className="text-sm opacity-90 mt-1">{language === 'ar' ? collegePlan.subtitleAr : collegePlan.subtitle}</p>
                </CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">{collegePlan.price.monthly}</span>
                  <span className="text-xl">{language === 'ar' ? ' درهم/شهر' : ' MAD/mois'}</span>
                  <p className="text-sm opacity-80 mt-1">{collegePlan.price.annual} DH {language === 'ar' ? '/ سنة' : '/ an'}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className={cn("text-center font-medium mb-4", collegePlan.textColor)}>
                  {language === 'ar' ? collegePlan.subjectsAr : collegePlan.subjects}
                </p>
                <ul className="space-y-3">
                  {(language === 'ar' ? collegePlan.featuresAr : collegePlan.features).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={cn("h-5 w-5", collegePlan.textColor)} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {language === 'ar' ? collegePlan.optionAr : collegePlan.option}
                </p>
                <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700" size="lg" asChild>
                  <Link to="/auth?plan=college-regional">{language === 'ar' ? 'اختر هذا الباك' : 'Choisir ce pack'}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Lycée */}
      <section id="lycee" className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            <GraduationCap className="inline-block h-8 w-8 mr-2 text-amber-600" />
            {language === 'ar' ? 'الثانوي' : 'Lycée'}{' '}
            <span className="gradient-text">{language === 'ar' ? '- البكالوريا' : '— Baccalauréat'}</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {lyceePlansList.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn("relative", plan.popular && "scale-105 z-10")}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      <Star className="h-3 w-3" /> {language === 'ar' ? 'الأكثر طلباً' : 'Populaire'}
                    </span>
                  </div>
                )}
                <Card className={cn("h-full shadow-xl", plan.popular ? "border-2" : "", plan.borderColor)}>
                  <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", plan.color)}>
                    <CardTitle className="text-center">
                      <span className="text-xl font-bold">{language === 'ar' ? plan.nameAr : plan.name}</span>
                      <p className="text-sm opacity-90 mt-1">{language === 'ar' ? plan.subtitleAr : plan.subtitle}</p>
                    </CardTitle>
                    <div className="text-center mt-4">
                      <span className="text-4xl font-bold">{plan.price.monthly}</span>
                      <span className="text-lg">{language === 'ar' ? ' درهم/شهر' : ' MAD/mois'}</span>
                      <p className="text-sm opacity-80 mt-1">{plan.price.annual} DH {language === 'ar' ? '/ سنة' : '/ an'}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className={cn("text-center font-medium mb-4 text-sm", plan.textColor)}>
                      {language === 'ar' ? plan.subjectsAr : plan.subjects}
                    </p>
                    <ul className="space-y-3 mb-4">
                      {(language === 'ar' ? plan.featuresAr : plan.features).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", plan.textColor)} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      {language === 'ar' ? plan.optionAr : plan.option}
                    </p>
                    <Button
                      className={cn("w-full", plan.popular && "bg-amber-600 hover:bg-amber-700")}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link to={`/auth?plan=${plan.id}`}>{language === 'ar' ? 'اختر هذا الباك' : 'Choisir ce pack'}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cours particuliers */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-8"
          >
            <UserRound className="inline-block h-6 w-6 mr-2 text-indigo-600" />
            {language === 'ar' ? 'حصص خاصة — بدون باقة' : 'Cours particuliers — Sans pack'}
          </motion.h2>
          <div className="flex justify-center max-w-md mx-auto">
            <Card className={cn("w-full shadow-xl border-2", individuelPlan.borderColor)}>
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
                  {(language === 'ar' ? individuelPlan.featuresAr : individuelPlan.features).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/auth?plan=particulier-suivi">{language === 'ar' ? 'طلب الدعم' : 'Demander un support'}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              {language === 'ar' ? 'ابدأ مسيرتك الدراسية الآن' : 'Commencez votre parcours éducatif'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {language === 'ar'
                ? 'انضم إلى آلاف الطلاب الذين يحققون النجاح مع CoursPro'
                : 'Rejoignez des milliers d\'élèves qui réussissent avec CoursPro'}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">{language === 'ar' ? 'سجل الآن' : "S'inscrire maintenant"}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgrammesPage;
