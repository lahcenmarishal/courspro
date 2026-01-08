import { motion } from "framer-motion";
import { GraduationCap, Video, Calendar, FileText, Bell, BarChart3, BookOpen, Award } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const colorClasses = {
  primary: { bg: "bg-primary-muted", text: "text-primary", icon: "bg-primary/10" },
  secondary: { bg: "bg-secondary-muted", text: "text-secondary", icon: "bg-secondary/10" },
  accent: { bg: "bg-accent-muted", text: "text-accent", icon: "bg-accent/10" },
};

export const Features = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Video, title: t("features.liveCourses"), description: t("features.liveCourses.desc"), color: "accent" },
    { icon: Calendar, title: t("features.schedule"), description: t("features.schedule.desc"), color: "secondary" },
    { icon: GraduationCap, title: t("features.teachers"), description: t("features.teachers.desc"), color: "primary" },
    { icon: FileText, title: t("features.homework"), description: t("features.homework.desc"), color: "accent" },
    { icon: BookOpen, title: t("features.resources"), description: t("features.resources.desc"), color: "primary" },
    { icon: BarChart3, title: t("features.grades"), description: t("features.grades.desc"), color: "secondary" },
    { icon: Bell, title: t("features.notifications"), description: t("features.notifications.desc"), color: "primary" },
    { icon: Award, title: t("features.certificates"), description: t("features.certificates.desc"), color: "accent" },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
            {t("features.label")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t("features.title")}{" "}
            <span className="gradient-text">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("features.description")}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`h-12 w-12 rounded-xl ${colors.icon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
