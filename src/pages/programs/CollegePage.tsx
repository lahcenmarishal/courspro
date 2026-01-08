import { motion } from "framer-motion";
import { Check, BookOpen, Clock, Users, Target, ArrowRight, GraduationCap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const CollegePage = () => {
  const { t } = useLanguage();

  const subjects = [
    {
      name: t("college.subjects.math"),
      description: t("college.subjects.math.desc"),
      icon: "📐",
      topics: [
        t("college.subjects.math.topic1"),
        t("college.subjects.math.topic2"),
        t("college.subjects.math.topic3"),
        t("college.subjects.math.topic4")
      ]
    },
    {
      name: t("college.subjects.french"),
      description: t("college.subjects.french.desc"),
      icon: "📚",
      topics: [
        t("college.subjects.french.topic1"),
        t("college.subjects.french.topic2"),
        t("college.subjects.french.topic3"),
        t("college.subjects.french.topic4")
      ]
    },
    {
      name: t("college.subjects.physics"),
      description: t("college.subjects.physics.desc"),
      icon: "🔬",
      topics: [
        t("college.subjects.physics.topic1"),
        t("college.subjects.physics.topic2"),
        t("college.subjects.physics.topic3"),
        t("college.subjects.physics.topic4")
      ]
    },
    {
      name: t("college.subjects.svt"),
      description: t("college.subjects.svt.desc"),
      icon: "🌿",
      topics: [
        t("college.subjects.svt.topic1"),
        t("college.subjects.svt.topic2"),
        t("college.subjects.svt.topic3"),
        t("college.subjects.svt.topic4")
      ]
    },
    {
      name: t("college.subjects.english"),
      description: t("college.subjects.english.desc"),
      icon: "🇬🇧",
      topics: [
        t("college.subjects.english.topic1"),
        t("college.subjects.english.topic2"),
        t("college.subjects.english.topic3"),
        t("college.subjects.english.topic4")
      ]
    }
  ];

  const features = [
    { icon: Clock, title: t("college.features.sessions"), description: t("college.features.sessions.desc") },
    { icon: Users, title: t("college.features.groups"), description: t("college.features.groups.desc") },
    { icon: BookOpen, title: t("college.features.exercises"), description: t("college.features.exercises.desc") },
    { icon: Target, title: t("college.features.tracking"), description: t("college.features.tracking.desc") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-emerald-500/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 font-semibold text-sm mb-6">
              {t("college.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("college.title")}<span className="gradient-text">{t("college.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("college.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?plan=college">
                  {t("college.cta.signup")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{t("college.cta.contact")}</Link>
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
            <Card className="border-emerald-500 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold">{t("college.pricing.title")}</span>
                  <p className="text-sm opacity-90 mt-1">{t("college.pricing.subtitle")}</p>
                </CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">150</span>
                  <span className="text-xl">{t("common.perMonth")}</span>
                  <p className="text-sm opacity-80 mt-1">700 {t("common.perYear")}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-medium text-emerald-600 mb-4">
                  {t("college.pricing.subjects")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>{t("college.pricing.feature1")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>{t("college.pricing.feature2")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>{t("college.pricing.feature3")}</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {t("college.pricing.singleSession")}
                </p>
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" size="lg" asChild>
                  <Link to="/auth?plan=college">{t("college.pricing.choose")}</Link>
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
            {t("college.features.title")} <span className="gradient-text">{t("college.features.titleHighlight")}</span>
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
                    <feature.icon className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
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
            {t("college.subjects.title")} <span className="gradient-text">{t("college.subjects.titleHighlight")}</span>
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
                          <Check className="h-4 w-4 text-emerald-600" />
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

      {/* Preparation Brevet */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Brain className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                {t("college.brevet.title")} <span className="gradient-text">{t("college.brevet.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground">
                {t("college.brevet.description")}
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">{t("college.brevet.successRate")}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">+500</div>
                  <p className="text-sm text-muted-foreground">{t("college.brevet.students")}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">5</div>
                  <p className="text-sm text-muted-foreground">{t("college.brevet.subjects")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              {t("college.cta2.title")}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {t("college.cta2.description")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?plan=college">{t("college.cta2.button")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollegePage;
