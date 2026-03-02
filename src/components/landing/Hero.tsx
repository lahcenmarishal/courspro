import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Calendar, Video } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt={t("hero.badge")} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 sm:space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-primary font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("hero.badge")}
            </motion.div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              {t("hero.title1")}{" "}
              <span className="gradient-text">{t("hero.title2")}</span>{" "}
              {t("hero.title3")}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">{t("hero.description")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <Link to="/auth?signup=true">
                <Button variant="hero" size="xl" className="w-full flex-col h-auto py-4 gap-1">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm sm:text-base font-bold">{t("hero.cta.signup")}</span>
                  <span className="text-[10px] sm:text-xs opacity-80 font-normal">{t("hero.cta.signupSub")}</span>
                </Button>
              </Link>
              <Link to="/auth/teacher">
                <Button variant="hero-outline" size="xl" className="w-full flex-col h-auto py-4 gap-1">
                  <Users className="h-6 w-6" />
                  <span className="text-sm sm:text-base font-bold">{t("hero.cta.discover")}</span>
                  <span className="text-[10px] sm:text-xs opacity-80 font-normal">{t("hero.cta.discoverSub")}</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-8 pt-6 sm:pt-8 border-t border-border/50">
              <div className="text-center sm:text-start">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">25+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{t("hero.stats.teachers")}</div>
              </div>
              <div className="text-center sm:text-start">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">500+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{t("hero.stats.students")}</div>
              </div>
              <div className="text-center sm:text-start">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">98%</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{t("hero.stats.success")}</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="relative hidden lg:block">
            <div className="relative glass rounded-2xl p-6 shadow-card backdrop-blur-xl border border-border/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{t("hero.card.school")}</div>
                      <div className="text-xs text-muted-foreground">{t("hero.card.admin")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-muted-foreground">{t("hero.card.online")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-center">
                    <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                    <div className="text-lg font-bold text-foreground">324</div>
                    <div className="text-xs text-muted-foreground">{t("hero.card.students")}</div>
                  </div>
                  <div className="rounded-xl bg-secondary/10 p-3 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-secondary mb-1" />
                    <div className="text-lg font-bold text-foreground">12</div>
                    <div className="text-xs text-muted-foreground">{t("hero.card.classes")}</div>
                  </div>
                  <div className="rounded-xl bg-accent/10 p-3 text-center">
                    <Video className="h-5 w-5 mx-auto text-accent mb-1" />
                    <div className="text-lg font-bold text-foreground">8</div>
                    <div className="text-xs text-muted-foreground">{t("hero.card.liveCourses")}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{t("hero.card.nextClass")}</span>
                    <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full font-medium">{t("hero.card.in15min")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">📐</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{t("hero.card.math")}</div>
                      <div className="text-sm text-muted-foreground">{t("hero.card.termS")}</div>
                    </div>
                    <Button size="sm" variant="accent">
                      <Video className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {t("hero.card.join")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">{t("hero.card.today")}</div>
                  <div className="space-y-2">
                    {[
                      { time: "08:00", subject: t("hero.card.french"), classLabel: t("hero.card.2ndeA"), color: "bg-primary" },
                      { time: "10:00", subject: t("hero.card.history"), classLabel: t("hero.card.1ereS"), color: "bg-secondary" },
                      { time: "14:00", subject: t("hero.card.physics"), classLabel: t("hero.card.termS2"), color: "bg-accent" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3">
                        <div className={`h-8 w-1 rounded-full ${item.color}`} />
                        <div className="text-sm text-muted-foreground w-12">{item.time}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{item.subject}</div>
                          <div className="text-xs text-muted-foreground">{item.classLabel}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 glass rounded-xl p-3 shadow-lg backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground text-sm">✓</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t("hero.card.attendance")}</div>
                  <div className="text-xs text-muted-foreground">324 {t("hero.card.students").toLowerCase()}</div>
                </div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -right-4 glass rounded-xl p-3 shadow-lg backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground text-sm">🎯</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t("hero.card.average")}</div>
                  <div className="text-xs text-muted-foreground">{t("hero.card.monthProgress")}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
