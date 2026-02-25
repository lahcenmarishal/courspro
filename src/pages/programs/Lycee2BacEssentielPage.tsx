import { motion } from "framer-motion";
import { Check, Clock, FileText, Phone, Award, ArrowRight, GraduationCap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Lycee2BacEssentielPage = () => {
  const { language } = useLanguage();

  const plan = {
    name: language === 'ar' ? "2 باك أساسي" : "2 Bac Essentiel",
    subtitle: language === 'ar' ? "الثانية باك - المواد الأساسية" : "2ème Bac - Matières principales",
    price: { monthly: 250, annual: 1000 },
    subjects: language === 'ar' ? "الرياضيات | ف.ك | ع.ح.أ" : "Math | PC | SVT",
    features: language === 'ar' ? [
      "3 حصص / أسبوع",
      "فروض محروسة + محاكاة",
      "متابعة أساسية طول فترة الاشتراك",
      "تحضير مكثف للامتحان الوطني"
    ] : [
      "3 séances / semaine",
      "Devoirs surveillés + simulations",
      "Suivi basique tout au long de l'abonnement",
      "Préparation intensive au national"
    ],
    option: language === 'ar' ? "100 درهم / شهر للمادة الواحدة" : "100 DH / mois pour une seule matière",
  };

  const subjects = [
    {
      name: language === 'ar' ? "الرياضيات" : "Mathématiques",
      description: language === 'ar' ? "التحليل، الجبر والهندسة المتقدمة" : "Analyse, algèbre et géométrie avancées",
      icon: "📐",
      topics: language === 'ar'
        ? ["الدوال والنهايات", "الاشتقاق والتكامل", "الاحتمالات", "المتتاليات العددية"]
        : ["Fonctions et limites", "Dérivation et intégration", "Probabilités", "Suites numériques"]
    },
    {
      name: language === 'ar' ? "الفيزياء والكيمياء" : "Physique-Chimie",
      description: language === 'ar' ? "العلوم التجريبية المعمقة" : "Sciences expérimentales approfondies",
      icon: "⚛️",
      topics: language === 'ar'
        ? ["الميكانيكا النيوتنية", "الكهرومغناطيسية", "الكيمياء العضوية", "الديناميكا الحرارية"]
        : ["Mécanique newtonienne", "Électromagnétisme", "Chimie organique", "Thermodynamique"]
    },
    {
      name: language === 'ar' ? "علوم الحياة والأرض" : "SVT",
      description: language === 'ar' ? "علوم الحياة المتقدمة" : "Sciences de la vie avancées",
      icon: "🧬",
      topics: language === 'ar'
        ? ["الوراثة", "المناعة", "الجيولوجيا", "علم البيئة"]
        : ["Génétique", "Immunologie", "Géologie", "Écologie"]
    }
  ];

  const features = [
    { icon: Clock, title: language === 'ar' ? "3 حصص / أسبوع" : "3 séances / semaine", description: language === 'ar' ? "مكثف للوطني" : "Intensif pour le national" },
    { icon: FileText, title: language === 'ar' ? "فروض محروسة" : "Devoirs surveillés", description: language === 'ar' ? "محاكاة منتظمة" : "Simulations régulières" },
    { icon: Phone, title: language === 'ar' ? "متابعة أساسية" : "Suivi basique", description: language === 'ar' ? "تقرير أسبوعي" : "Bilan hebdomadaire" },
    { icon: Award, title: language === 'ar' ? "بنك التمارين" : "Banque d'exercices", description: language === 'ar' ? "موارد غير محدودة" : "Ressources illimitées" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-purple-500/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-purple-500/10 rounded-full text-purple-600 font-semibold text-sm mb-6">
              {language === 'ar' ? "الباقة الأساسية" : "Pack Essentiel"}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {plan.name} — <span className="gradient-text">{plan.subtitle}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{plan.subjects}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?plan=lycee-2bac-essentiel">{language === 'ar' ? "سجل الآن" : "S'inscrire maintenant"} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{language === 'ar' ? "اتصل بنا" : "Nous contacter"}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md mx-auto">
            <Card className="border-purple-500 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold">{plan.name}</span>
                  <p className="text-sm opacity-90 mt-1">{plan.subtitle}</p>
                </CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">{plan.price.monthly}</span>
                  <span className="text-xl"> {language === 'ar' ? "درهم/شهر" : "DH/mois"}</span>
                  <p className="text-sm opacity-80 mt-1">{plan.price.annual} DH {language === 'ar' ? "/سنة" : "/an"}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-medium text-purple-600 mb-4 text-sm">{plan.subjects}</p>
                <ul className="space-y-3 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground text-center mb-4">{plan.option}</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg" asChild>
                  <Link to="/auth?plan=lycee-2bac-essentiel">{language === 'ar' ? "اختر هذه الباقة" : "Choisir ce pack"}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-12">
            {language === 'ar' ? "ما هو" : "Ce qui est"} <span className="gradient-text">{language === 'ar' ? "متضمن" : "inclus"}</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-12">
            {language === 'ar' ? "المواد" : "Matières"} <span className="gradient-text">{language === 'ar' ? "المدرسة" : "enseignées"}</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subjects.map((subject, index) => (
              <motion.div key={subject.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{subject.icon}</div>
                    <CardTitle>{subject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subject.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {subject.topics.map((topic) => (
                        <li key={topic} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-purple-600" />{topic}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <Brain className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4">{language === 'ar' ? "التحضير لـ" : "Préparation au"} <span className="gradient-text">{language === 'ar' ? "الوطني" : "National"}</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-purple-600 mb-2">98%</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "نسبة النجاح" : "Taux de réussite"}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-purple-600 mb-2">+500</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "طلاب" : "Élèves"}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-purple-600 mb-2">3</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "مواد" : "Matières"}</p></CardContent></Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">{language === 'ar' ? "مستعد لنيل البكالوريا؟" : "Prêt à décrocher votre BAC ?"}</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{language === 'ar' ? "انضم واستعد بشكل مثالي" : "Rejoignez le pack essentiel et réussissez"}</p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?plan=lycee-2bac-essentiel">{language === 'ar' ? "ابدأ الآن" : "Commencer maintenant"}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lycee2BacEssentielPage;
