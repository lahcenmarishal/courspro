import { motion } from "framer-motion";
import { Check, BookOpen, Clock, Users, Award, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const PrimairePage = () => {
  const { t } = useLanguage();

  const subjects = [
    {
      name: t("primaire.subjects.arabic"),
      description: t("primaire.subjects.arabic.desc"),
      icon: "📖",
      topics: [
        t("primaire.subjects.arabic.topic1"),
        t("primaire.subjects.arabic.topic2"),
        t("primaire.subjects.arabic.topic3"),
        t("primaire.subjects.arabic.topic4")
      ]
    },
    {
      name: t("primaire.subjects.french"),
      description: t("primaire.subjects.french.desc"),
      icon: "🇫🇷",
      topics: [
        t("primaire.subjects.french.topic1"),
        t("primaire.subjects.french.topic2"),
        t("primaire.subjects.french.topic3"),
        t("primaire.subjects.french.topic4")
      ]
    },
    {
      name: t("primaire.subjects.math"),
      description: t("primaire.subjects.math.desc"),
      icon: "🔢",
      topics: [
        t("primaire.subjects.math.topic1"),
        t("primaire.subjects.math.topic2"),
        t("primaire.subjects.math.topic3"),
        t("primaire.subjects.math.topic4")
      ]
    }
  ];

  const features = [
    { icon: Clock, title: t("primaire.features.sessions"), description: t("primaire.features.sessions.desc") },
    { icon: Users, title: t("primaire.features.groups"), description: t("primaire.features.groups.desc") },
    { icon: BookOpen, title: t("primaire.features.duration"), description: t("primaire.features.duration.desc") },
    { icon: Award, title: t("primaire.features.tracking"), description: t("primaire.features.tracking.desc") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              {t("primaire.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("primaire.title")} <span className="gradient-text">{t("primaire.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("primaire.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?plan=primaire">
                  {t("primaire.cta.signup")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{t("primaire.cta.contact")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <Card className="border-primary shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold">{t("primaire.pricing.title")}</span>
                  <p className="text-sm opacity-90 mt-1">{t("primaire.pricing.subtitle")}</p>
                </CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">100</span>
                  <span className="text-xl">{t("common.perMonth")}</span>
                  <p className="text-sm opacity-80 mt-1">500 {t("common.perYear")}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-medium text-primary mb-4">
                  {t("primaire.pricing.subjects")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{t("primaire.pricing.feature1")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{t("primaire.pricing.feature2")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{t("primaire.pricing.feature3")}</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {t("primaire.pricing.singleSession")}
                </p>
                <Button className="w-full mt-6" size="lg" asChild>
                  <Link to="/auth?plan=primaire">{t("primaire.pricing.choose")}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
            {t("primaire.features.title")} <span className="gradient-text">{t("primaire.features.titleHighlight")}</span>
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
                    <feature.icon className="h-12 w-12 mx-auto text-primary mb-4" />
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
            {t("primaire.subjects.title")} <span className="gradient-text">{t("primaire.subjects.titleHighlight")}</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
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
                          <Check className="h-4 w-4 text-primary" />
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
              {t("primaire.cta2.title")}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {t("primaire.cta2.description")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?plan=primaire">{t("primaire.cta2.button")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrimairePage;
