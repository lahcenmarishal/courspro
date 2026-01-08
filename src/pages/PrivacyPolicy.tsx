import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText, Users, Database, Bell, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { LucideIcon } from "lucide-react";

interface Section {
  icon: LucideIcon;
  titleKey: string;
  contentKeys: string[];
}

interface Right {
  titleKey: string;
  descriptionKey: string;
}

const PrivacyPolicy = () => {
  const { t, dir } = useLanguage();

  const sections: Section[] = [
    {
      icon: Shield,
      titleKey: "privacy.section1.title",
      contentKeys: [
        "privacy.section1.content1",
        "privacy.section1.content2",
        "privacy.section1.content3"
      ]
    },
    {
      icon: Eye,
      titleKey: "privacy.section2.title",
      contentKeys: [
        "privacy.section2.content1",
        "privacy.section2.content2",
        "privacy.section2.content3",
        "privacy.section2.content4"
      ]
    },
    {
      icon: Database,
      titleKey: "privacy.section3.title",
      contentKeys: [
        "privacy.section3.content1",
        "privacy.section3.content2",
        "privacy.section3.content3",
        "privacy.section3.content4"
      ]
    },
    {
      icon: FileText,
      titleKey: "privacy.section4.title",
      contentKeys: [
        "privacy.section4.content1",
        "privacy.section4.content2",
        "privacy.section4.content3",
        "privacy.section4.content4",
        "privacy.section4.content5"
      ]
    },
    {
      icon: Lock,
      titleKey: "privacy.section5.title",
      contentKeys: [
        "privacy.section5.content1",
        "privacy.section5.content2",
        "privacy.section5.content3",
        "privacy.section5.content4",
        "privacy.section5.content5"
      ]
    },
    {
      icon: Users,
      titleKey: "privacy.section6.title",
      contentKeys: [
        "privacy.section6.content1",
        "privacy.section6.content2",
        "privacy.section6.content3",
        "privacy.section6.content4"
      ]
    }
  ];

  const rights: Right[] = [
    { titleKey: "privacy.rights.access", descriptionKey: "privacy.rights.access.desc" },
    { titleKey: "privacy.rights.rectification", descriptionKey: "privacy.rights.rectification.desc" },
    { titleKey: "privacy.rights.deletion", descriptionKey: "privacy.rights.deletion.desc" },
    { titleKey: "privacy.rights.opposition", descriptionKey: "privacy.rights.opposition.desc" }
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {t("privacy.title")} <span className="gradient-text">{t("privacy.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("privacy.heroDesc")}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t("privacy.lastUpdate")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      {t(section.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.contentKeys.map((key, i) => (
                        <li key={i} className="text-muted-foreground leading-relaxed">
                          • {t(key)}
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

      {/* User Rights */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="gradient-text">{t("privacy.rights.title")}</span>
            </h2>
            <p className="text-muted-foreground">
              {t("privacy.rights.subtitle")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {rights.map((right, index) => (
              <motion.div
                key={right.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">{t(right.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(right.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  {t("privacy.cookies.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>{t("privacy.cookies.desc")}</p>
                <p><strong className="text-foreground">{t("privacy.cookies.essential")}</strong> {t("privacy.cookies.essential.desc")}</p>
                <p><strong className="text-foreground">{t("privacy.cookies.analytics")}</strong> {t("privacy.cookies.analytics.desc")}</p>
                <p><strong className="text-foreground">{t("privacy.cookies.preferences")}</strong> {t("privacy.cookies.preferences.desc")}</p>
                <p>{t("privacy.cookies.manage")}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Mail className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl font-bold mb-4">
              {t("privacy.contact.title")}
            </h2>
            <p className="opacity-90 mb-6">
              {t("privacy.contact.desc")}
            </p>
            <div className="space-y-2 text-sm opacity-80">
              <p>{t("privacy.contact.email")}</p>
              <p>{t("privacy.contact.address")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;