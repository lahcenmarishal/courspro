import { motion } from "framer-motion";
import { Check, Clock, FileText, Phone, Award, ArrowRight, GraduationCap, Brain, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const LyceePage = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t("lycee.plans.1bac.name"),
      subtitle: t("lycee.plans.1bac.subtitle"),
      price: { monthly: 200, annual: 900 },
      subjects: t("lycee.plans.1bac.subjects"),
      features: [
        t("lycee.plans.1bac.feature1"),
        t("lycee.plans.1bac.feature2"),
        t("lycee.plans.1bac.feature3")
      ],
      option: t("lycee.plans.1bac.option"),
      color: "from-blue-600 to-blue-500",
      popular: false
    },
    {
      name: t("lycee.plans.2bac.essential.name"),
      subtitle: t("lycee.plans.2bac.essential.subtitle"),
      price: { monthly: 250, annual: 1200 },
      subjects: t("lycee.plans.2bac.essential.subjects"),
      features: [
        t("lycee.plans.2bac.essential.feature1"),
        t("lycee.plans.2bac.essential.feature2"),
        t("lycee.plans.2bac.essential.feature3"),
        t("lycee.plans.2bac.essential.feature4")
      ],
      option: t("lycee.plans.2bac.essential.option"),
      color: "from-purple-600 to-purple-500",
      popular: false
    },
    {
      name: t("lycee.plans.2bac.total.name"),
      subtitle: t("lycee.plans.2bac.total.subtitle"),
      price: { monthly: 350, annual: 1500 },
      subjects: t("lycee.plans.2bac.total.subjects"),
      features: [
        t("lycee.plans.2bac.total.feature1"),
        t("lycee.plans.2bac.total.feature2"),
        t("lycee.plans.2bac.total.feature3"),
        t("lycee.plans.2bac.total.feature4")
      ],
      option: t("lycee.plans.2bac.total.option"),
      color: "from-amber-600 to-amber-500",
      popular: true
    }
  ];

  const subjects = [
    {
      name: t("lycee.subjects.math"),
      description: t("lycee.subjects.math.desc"),
      icon: "📐",
      topics: [
        t("lycee.subjects.math.topic1"),
        t("lycee.subjects.math.topic2"),
        t("lycee.subjects.math.topic3"),
        t("lycee.subjects.math.topic4")
      ]
    },
    {
      name: t("lycee.subjects.physics"),
      description: t("lycee.subjects.physics.desc"),
      icon: "⚛️",
      topics: [
        t("lycee.subjects.physics.topic1"),
        t("lycee.subjects.physics.topic2"),
        t("lycee.subjects.physics.topic3"),
        t("lycee.subjects.physics.topic4")
      ]
    },
    {
      name: t("lycee.subjects.svt"),
      description: t("lycee.subjects.svt.desc"),
      icon: "🧬",
      topics: [
        t("lycee.subjects.svt.topic1"),
        t("lycee.subjects.svt.topic2"),
        t("lycee.subjects.svt.topic3"),
        t("lycee.subjects.svt.topic4")
      ]
    },
    {
      name: t("lycee.subjects.philosophy"),
      description: t("lycee.subjects.philosophy.desc"),
      icon: "🎓",
      topics: [
        t("lycee.subjects.philosophy.topic1"),
        t("lycee.subjects.philosophy.topic2"),
        t("lycee.subjects.philosophy.topic3"),
        t("lycee.subjects.philosophy.topic4")
      ]
    },
    {
      name: t("lycee.subjects.english"),
      description: t("lycee.subjects.english.desc"),
      icon: "🌍",
      topics: [
        t("lycee.subjects.english.topic1"),
        t("lycee.subjects.english.topic2"),
        t("lycee.subjects.english.topic3"),
        t("lycee.subjects.english.topic4")
      ]
    },
    {
      name: t("lycee.subjects.french"),
      description: t("lycee.subjects.french.desc"),
      icon: "📖",
      topics: [
        t("lycee.subjects.french.topic1"),
        t("lycee.subjects.french.topic2"),
        t("lycee.subjects.french.topic3"),
        t("lycee.subjects.french.topic4")
      ]
    }
  ];

  const features = [
    { icon: Clock, title: t("lycee.features.hours"), description: t("lycee.features.hours.desc") },
    { icon: FileText, title: t("lycee.features.exams"), description: t("lycee.features.exams.desc") },
    { icon: Phone, title: t("lycee.features.calls"), description: t("lycee.features.calls.desc") },
    { icon: Award, title: t("lycee.features.exercises"), description: t("lycee.features.exercises.desc") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-amber-500/10 rounded-full text-amber-600 font-semibold text-sm mb-6">
              {t("lycee.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("lycee.title")} <span className="gradient-text">{t("lycee.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("lycee.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?plan=lycee">
                  {t("lycee.cta.signup")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{t("lycee.cta.contact")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            {t("lycee.plans.title")} <span className="gradient-text">{t("lycee.plans.titleHighlight")}</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name + plan.subtitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative",
                  plan.popular && "scale-105 z-10"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      <Star className="h-3 w-3" /> {t("lycee.plans.popular")}
                    </span>
                  </div>
                )}
                <Card className={cn(
                  "h-full shadow-xl",
                  plan.popular ? "border-amber-500 border-2" : "border-border"
                )}>
                  <CardHeader className={cn("text-white rounded-t-lg bg-gradient-to-r", plan.color)}>
                    <CardTitle className="text-center">
                      <span className="text-xl font-bold">{plan.name}</span>
                      <p className="text-sm opacity-90 mt-1">{plan.subtitle}</p>
                    </CardTitle>
                    <div className="text-center mt-4">
                      <span className="text-4xl font-bold">{plan.price.monthly}</span>
                      <span className="text-lg">{t("common.perMonth")}</span>
                      <p className="text-sm opacity-80 mt-1">{plan.price.annual} {t("common.perYear")}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-center font-medium text-primary mb-4 text-sm">
                      {plan.subjects}
                    </p>
                    <ul className="space-y-3 mb-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      {plan.option}
                    </p>
                    <Button 
                      className={cn("w-full", plan.popular && "bg-amber-600 hover:bg-amber-700")} 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg" 
                      asChild
                    >
                      <Link to="/auth?plan=lycee">{t("lycee.plans.choose")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            {t("lycee.features.title")} <span className="gradient-text">{t("lycee.features.titleHighlight")}</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
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

      {/* Subjects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            {t("lycee.subjects.title")} <span className="gradient-text">{t("lycee.subjects.titleHighlight")}</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{subject.icon}</div>
                    <CardTitle>{subject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subject.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {subject.topics.map((topic) => (
                        <li key={topic} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-amber-600" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Brain className="h-16 w-16 mx-auto text-amber-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                {t("lycee.stats.title")} <span className="gradient-text">{t("lycee.stats.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground">
                {t("lycee.stats.description")}
              </p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">98%</div>
                  <p className="text-sm text-muted-foreground">{t("lycee.stats.successRate")}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">15.5</div>
                  <p className="text-sm text-muted-foreground">{t("lycee.stats.average")}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">+1000</div>
                  <p className="text-sm text-muted-foreground">{t("lycee.stats.students")}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-amber-600 mb-2">45%</div>
                  <p className="text-sm text-muted-foreground">{t("lycee.stats.honors")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              {t("lycee.cta2.title")}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {t("lycee.cta2.description")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?plan=lycee">{t("lycee.cta2.button")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LyceePage;
