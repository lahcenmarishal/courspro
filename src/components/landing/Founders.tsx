import { motion } from "framer-motion";
import founderAmine from "@/assets/founder-amine.webp";
import founderOmar from "@/assets/founder-omar.webp";
import { useLanguage } from "@/hooks/useLanguage";

export const Founders = () => {
  const { t } = useLanguage();

  const founders = [
    {
      name: t("founders.amine.name"),
      role: t("founders.amine.role"),
      image: founderAmine,
      description: t("founders.amine.description"),
      imagePosition: "right"
    },
    {
      name: t("founders.omar.name"),
      role: t("founders.omar.role"),
      image: founderOmar,
      description: t("founders.omar.description"),
      imagePosition: "left"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t("founders.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("founders.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("founders.description")}</p>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {founders.map((founder, index) => (
            <motion.div key={founder.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className={`flex flex-col ${founder.imagePosition === "right" ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 lg:gap-16`}>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-xl">
                    <img src={founder.image} alt={founder.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="absolute -z-10 -top-4 -left-4 w-full h-full rounded-full border-2 border-primary/20" />
                  <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-full border-2 border-secondary/20" />
                </div>
              </div>

              <div className={`flex-1 ${founder.imagePosition === "right" ? "md:pr-8" : "md:pl-8"}`}>
                <div className={`relative p-6 md:p-8 bg-card rounded-2xl shadow-lg border border-border/50 ${
                  founder.imagePosition === "right" ? "md:border-s-4 md:border-s-primary" : "md:border-e-4 md:border-e-primary"
                }`}>
                  <div className="absolute top-4 start-4 text-6xl text-primary/10 font-serif leading-none">"</div>
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{founder.name}</h3>
                    <p className="text-primary font-medium mb-4 text-sm md:text-base">{founder.role}</p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{founder.description}</p>
                  </div>
                  <div className={`absolute bottom-0 ${founder.imagePosition === "right" ? "end-0" : "start-0"} w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-tl-full`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
