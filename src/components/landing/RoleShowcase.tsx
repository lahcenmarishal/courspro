import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, BookOpen, GraduationCap, Users, Check, Calendar, Video, FileText, Bell, CreditCard, BarChart3, Settings, MessageSquare, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import teacherImage from "@/assets/teacher-portrait.jpg";
import studentImage from "@/assets/student-learning.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const colorClasses = {
  primary: { bg: "bg-primary", bgMuted: "bg-primary/10", text: "text-primary", border: "border-primary/30", gradient: "gradient-primary" },
  secondary: { bg: "bg-secondary", bgMuted: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30", gradient: "gradient-secondary" },
  accent: { bg: "bg-accent", bgMuted: "bg-accent/10", text: "text-accent", border: "border-accent/30", gradient: "gradient-accent" },
};

export const RoleShowcase = () => {
  const [activeRole, setActiveRole] = useState("teacher");
  const { t } = useLanguage();

  const roles = [
    {
      id: "teacher", title: t("roles.teacher"), subtitle: t("roles.teacher.subtitle"), icon: BookOpen, color: "accent", image: teacherImage,
      features: [
        { icon: Calendar, text: t("roles.feature.personalSchedule") },
        { icon: Video, text: t("roles.feature.meetAccess") },
        { icon: FileText, text: t("roles.feature.createHomework") },
        { icon: Award, text: t("roles.feature.grading") },
        { icon: Users, text: t("roles.feature.studentTracking") },
        { icon: MessageSquare, text: t("roles.feature.communication") },
      ],
    },
    {
      id: "student", title: t("roles.student"), subtitle: t("roles.student.subtitle"), icon: GraduationCap, color: "secondary", image: studentImage,
      features: [
        { icon: Calendar, text: t("roles.feature.dailySchedule") },
        { icon: Video, text: t("roles.feature.liveAccess") },
        { icon: FileText, text: t("roles.feature.submitHomework") },
        { icon: Award, text: t("roles.feature.viewGrades") },
        { icon: Bell, text: t("roles.feature.importantNotifications") },
        { icon: BookOpen, text: t("roles.feature.resourcesReplays") },
      ],
    },
  ];

  const currentRole = roles.find(r => r.id === activeRole)!;
  const colors = colorClasses[currentRole.color as keyof typeof colorClasses];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">{t("roles.label")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
            {t("roles.title")}{" "}<span className="gradient-text">{t("roles.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("roles.description")}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {roles.map((role) => {
            const roleColors = colorClasses[role.color as keyof typeof colorClasses];
            const isActive = activeRole === role.id;
            return (
              <button key={role.id} onClick={() => setActiveRole(role.id)}
                className={cn("flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300",
                  isActive ? `${roleColors.gradient} text-primary-foreground shadow-lg` : "bg-card hover:bg-card/80 text-muted-foreground border border-border")}>
                <role.icon className="h-5 w-5" />
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>

        <motion.div key={activeRole} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              {currentRole.image ? (
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-border">
                  <img src={currentRole.image} alt={currentRole.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className={`h-16 w-16 rounded-2xl ${colors.gradient} flex items-center justify-center shadow-lg`}>
                  <currentRole.icon className="h-8 w-8 text-primary-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-foreground">{currentRole.title}</h3>
                <p className="text-muted-foreground">{currentRole.subtitle}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {currentRole.features.map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  className={cn("flex items-center gap-3 p-4 rounded-xl border bg-card", colors.border)}>
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors.bg)}>
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            {currentRole.image && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="absolute -top-8 -right-4 z-20 hidden lg:block">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-background shadow-xl">
                    <img src={currentRole.image} alt={currentRole.title} className="h-full w-full object-cover" />
                  </div>
                  <div className={cn("absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center shadow-lg", colors.bg)}>
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            )}

            <div className={cn("relative glass rounded-2xl p-6 shadow-card border backdrop-blur-xl", colors.border)}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colors.gradient)}>
                      <currentRole.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{t("roles.dashboard")}</div>
                      <div className="text-xs text-muted-foreground">{currentRole.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-muted-foreground">{t("common.online")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "324", label: t("common.students") },
                    { value: "12", label: t("common.classes") },
                    { value: "8", label: t("common.courses") },
                  ].map((item, i) => (
                    <div key={i} className={cn("rounded-xl p-4 text-center", colors.bgMuted)}>
                      <div className="text-2xl font-bold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { text: t("hero.card.math"), time: "08:00" },
                    { text: t("hero.card.french"), time: "10:00" },
                    { text: t("hero.card.physics"), time: "14:00" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                      <div className={cn("h-8 w-1 rounded-full", colors.bg)} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{item.text}</div>
                        <div className="text-xs text-muted-foreground">{t("hero.card.today")} {item.time}</div>
                      </div>
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", colors.bgMuted)}>
                        <Check className={cn("h-4 w-4", colors.text)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -start-4 glass rounded-lg px-4 py-2 shadow-lg backdrop-blur-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", colors.bg)}>
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t("roles.fullAccess")}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
