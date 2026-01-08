import { motion } from "framer-motion";
import { FileText, Users, CreditCard, AlertTriangle, Scale, BookOpen, Ban, RefreshCw } from "lucide-react";
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

interface KeyPoint {
  titleKey: string;
  descriptionKey: string;
}

const TermsOfService = () => {
  const { t, dir } = useLanguage();

  const sections: Section[] = [
    {
      icon: FileText,
      titleKey: "terms.section1.title",
      contentKeys: [
        "terms.section1.content1",
        "terms.section1.content2",
        "terms.section1.content3",
        "terms.section1.content4"
      ]
    },
    {
      icon: Users,
      titleKey: "terms.section2.title",
      contentKeys: [
        "terms.section2.content1",
        "terms.section2.content2",
        "terms.section2.content3",
        "terms.section2.content4",
        "terms.section2.content5"
      ]
    },
    {
      icon: BookOpen,
      titleKey: "terms.section3.title",
      contentKeys: [
        "terms.section3.content1",
        "terms.section3.content2",
        "terms.section3.content3",
        "terms.section3.content4",
        "terms.section3.content5"
      ]
    },
    {
      icon: CreditCard,
      titleKey: "terms.section4.title",
      contentKeys: [
        "terms.section4.content1",
        "terms.section4.content2",
        "terms.section4.content3",
        "terms.section4.content4",
        "terms.section4.content5"
      ]
    },
    {
      icon: RefreshCw,
      titleKey: "terms.section5.title",
      contentKeys: [
        "terms.section5.content1",
        "terms.section5.content2",
        "terms.section5.content3",
        "terms.section5.content4",
        "terms.section5.content5"
      ]
    },
    {
      icon: Ban,
      titleKey: "terms.section6.title",
      contentKeys: [
        "terms.section6.content1",
        "terms.section6.content2",
        "terms.section6.content3",
        "terms.section6.content4",
        "terms.section6.content5",
        "terms.section6.content6"
      ]
    },
    {
      icon: Scale,
      titleKey: "terms.section7.title",
      contentKeys: [
        "terms.section7.content1",
        "terms.section7.content2",
        "terms.section7.content3",
        "terms.section7.content4"
      ]
    },
    {
      icon: AlertTriangle,
      titleKey: "terms.section8.title",
      contentKeys: [
        "terms.section8.content1",
        "terms.section8.content2",
        "terms.section8.content3",
        "terms.section8.content4"
      ]
    }
  ];

  const keyPoints: KeyPoint[] = [
    { titleKey: "terms.keyPoints.age", descriptionKey: "terms.keyPoints.age.desc" },
    { titleKey: "terms.keyPoints.availability", descriptionKey: "terms.keyPoints.availability.desc" },
    { titleKey: "terms.keyPoints.support", descriptionKey: "terms.keyPoints.support.desc" },
    { titleKey: "terms.keyPoints.law", descriptionKey: "terms.keyPoints.law.desc" }
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {t("terms.title")} <span className="gradient-text">{t("terms.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("terms.heroDesc")}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t("terms.lastUpdate")}
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

      {/* Key Points */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {t("terms.keyPoints.title")} <span className="gradient-text">{t("terms.keyPoints.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground">
              {t("terms.keyPoints.subtitle")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {keyPoints.map((point, index) => (
              <motion.div
                key={point.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">{t(point.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(point.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
            <Scale className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl font-bold mb-4">
              {t("terms.contact.title")}
            </h2>
            <p className="opacity-90 mb-6">
              {t("terms.contact.desc")}
            </p>
            <div className="space-y-2 text-sm opacity-80">
              <p>{t("terms.contact.email")}</p>
              <p>{t("terms.contact.address")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;