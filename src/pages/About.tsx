import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Target, Eye, Users, Award, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useLanguage } from '@/hooks/useLanguage';

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: BookOpen,
      title: t("about.values.excellence"),
      description: t("about.values.excellence.desc")
    },
    {
      icon: Users,
      title: t("about.values.accessibility"),
      description: t("about.values.accessibility.desc")
    },
    {
      icon: Heart,
      title: t("about.values.kindness"),
      description: t("about.values.kindness.desc")
    },
    {
      icon: Award,
      title: t("about.values.innovation"),
      description: t("about.values.innovation.desc")
    }
  ];

  const stats = [
    { number: "5000+", label: t("about.stats.students") },
    { number: "200+", label: t("about.stats.teachers") },
    { number: "50+", label: t("about.stats.subjects") },
    { number: "98%", label: t("about.stats.satisfaction") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t("about.back")}
            </Link>
            
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {t("about.title")}<span className="gradient-text">{t("about.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("about.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("about.mission.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission.description")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("about.vision.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision.description")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t("about.values.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.values.description")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-center text-primary-foreground"
          >
            <h2 className="text-2xl font-bold mb-4">{t("about.cta.title")}</h2>
            <p className="opacity-90 mb-6">
              {t("about.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="secondary" size="lg">
                  {t("about.cta.signup")}
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  {t("about.cta.contact")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
