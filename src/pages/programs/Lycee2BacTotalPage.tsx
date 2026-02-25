import { motion } from "framer-motion";
import { Check, Clock, FileText, Phone, Award, ArrowRight, GraduationCap, Brain, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Lycee2BacTotalPage = () => {
  const { language } = useLanguage();

  const plan = {
    name: language === 'ar' ? "2 باك الوطني الكامل" : "2 Bac National Complet",
    subtitle: language === 'ar' ? "الثانية باك - جميع المواد" : "2ème Bac - Toutes matières",
    price: { monthly: 350, annual: 1300 },
    subjects: language === 'ar' ? "الرياضيات | ف.ك | ع.ح.أ | الإنجليزية | الفلسفة | الفرنسية" : "Math | PC | SVT | Anglais | Philo | Français",
    features: language === 'ar' ? [
      "6 حصص / أسبوع",
      "فروض محروسة + محاكاة كاملة",
      "متابعة أساسية طول فترة الاشتراك",
      "تحضير شامل للامتحان الوطني"
    ] : [
      "6 séances / semaine",
      "DS + simulations complètes",
      "Suivi basique tout au long de l'abonnement",
      "Préparation complète au national"
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
    },
    {
      name: language === 'ar' ? "الإنجليزية" : "Anglais",
      description: language === 'ar' ? "المستوى المتقدم" : "Niveau avancé",
      icon: "🌍",
      topics: language === 'ar'
        ? ["كتابة المقالات", "الفهم", "القواعد المتقدمة", "المحادثة"]
        : ["Essay writing", "Comprehension", "Grammar advanced", "Speaking"]
    },
    {
      name: language === 'ar' ? "الفلسفة" : "Philosophie",
      description: language === 'ar' ? "التفكير النقدي والحجاج" : "Pensée critique et argumentation",
      icon: "🎓",
      topics: language === 'ar'
        ? ["الإبستمولوجيا", "الأخلاق", "الميتافيزيقا", "السياسة"]
        : ["Épistémologie", "Éthique", "Métaphysique", "Politique"]
    },
    {
      name: language === 'ar' ? "الفرنسية" : "Français",
      description: language === 'ar' ? "الأدب والتحليل" : "Littérature et analyse",
      icon: "📖",
      topics: language === 'ar'
        ? ["التحليل الأدبي", "المقالة", "التعليق", "التعبير الشفوي"]
        : ["Analyse littéraire", "Dissertation", "Commentaire", "Expression orale"]
    }
  ];

  const features = [
    { icon: Clock, title: language === 'ar' ? "6 حصص / أسبوع" : "6 séances / semaine", description: language === 'ar' ? "مكثف للوطني" : "Intensif pour le national" },
    { icon: FileText, title: language === 'ar' ? "فروض محروسة" : "Devoirs surveillés", description: language === 'ar' ? "محاكاة كاملة" : "Simulations complètes" },
    { icon: Phone, title: language === 'ar' ? "متابعة أساسية" : "Suivi basique", description: language === 'ar' ? "تقرير أسبوعي" : "Bilan hebdomadaire" },
    { icon: Award, title: language === 'ar' ? "بنك التمارين" : "Banque d'exercices", description: language === 'ar' ? "وصول غير محدود" : "Accès illimité" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500/10 rounded-full text-amber-600 font-semibold text-sm mb-6">
              <Star className="h-4 w-4" /> {language === 'ar' ? "الباقة الأكثر طلباً" : "Pack le plus populaire"}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {plan.name} — <span className="gradient-text">{plan.subtitle}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{plan.subjects}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?plan=lycee-2bac-total">{language === 'ar' ? "سجل الآن" : "S'inscrire maintenant"} <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md mx-auto relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                <Star className="h-3 w-3" /> {language === 'ar' ? "الأكثر طلباً" : "Populaire"}
              </span>
            </div>
            <Card className="border-amber-500 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-t-lg">
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
                <p className="text-center font-medium text-amber-600 mb-4 text-sm">{plan.subjects}</p>
                <ul className="space-y-3 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground text-center mb-4">{plan.option}</p>
                <Button className="w-full bg-amber-600 hover:bg-amber-700" size="lg" asChild>
                  <Link to="/auth?plan=lycee-2bac-total">{language === 'ar' ? "اختر هذه الباقة" : "Choisir ce pack"}</Link>
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
                    <feature.icon className="h-12 w-12 mx-auto text-amber-600 mb-4" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <li key={topic} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-amber-600" />{topic}</li>
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
              <Brain className="h-16 w-16 mx-auto text-amber-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4">{language === 'ar' ? "التحضير لـ" : "Préparation au"} <span className="gradient-text">{language === 'ar' ? "البكالوريا" : "Baccalauréat"}</span></h2>
              <p className="text-muted-foreground">{language === 'ar' ? "نتائج تتحدث عن نفسها" : "Des résultats qui parlent d'eux-mêmes"}</p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-amber-600 mb-2">98%</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "نسبة النجاح" : "Taux de réussite"}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-amber-600 mb-2">15.5</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "المعدل العام" : "Moyenne générale"}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-amber-600 mb-2">+1000</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "طلاب" : "Bacheliers"}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-amber-600 mb-2">45%</div><p className="text-sm text-muted-foreground">{language === 'ar' ? "ميزة حسن جداً" : "Mentions TB"}</p></CardContent></Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">{language === 'ar' ? "مستعد لنيل البكالوريا؟" : "Prêt à décrocher votre BAC ?"}</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{language === 'ar' ? "انضم لبرنامجنا الثانوي وعظم فرص نجاحك" : "Rejoignez notre programme et maximisez vos chances de réussite"}</p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?plan=lycee-2bac-total">{language === 'ar' ? "ابدأ الآن" : "Commencer maintenant"}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lycee2BacTotalPage;
