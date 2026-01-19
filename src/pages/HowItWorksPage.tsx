import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { RoleShowcase } from "@/components/landing/RoleShowcase";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Video, BookOpen, Award, Calendar, Bell } from "lucide-react";

const HowItWorksPage = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      icon: Users,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      icon: Calendar,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      icon: Video,
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
    {
      icon: BookOpen,
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
    },
    {
      icon: Award,
      title: t("howItWorks.step5.title"),
      description: t("howItWorks.step5.description"),
    },
    {
      icon: Bell,
      title: t("howItWorks.step6.title"),
      description: t("howItWorks.step6.description"),
    },
  ];

  useEffect(() => {
    document.title = `${t("howItWorks.pageTitle")} | CoursPro`;
  }, [t]);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
                {t("howItWorks.label")}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {t("howItWorks.title")}{" "}
                <span className="gradient-text">{t("howItWorks.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("howItWorks.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-4xl font-bold text-primary/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Showcase */}
        <RoleShowcase />
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
