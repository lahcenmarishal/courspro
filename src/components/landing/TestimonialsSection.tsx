import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useLanguage } from "@/hooks/useLanguage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const { data: testimonials, isLoading } = useTestimonials(true);

  const displayedTestimonials = testimonials?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (displayedTestimonials.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {language === "ar" ? "آراء عملائنا" : "Témoignages"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === "ar" ? "ماذا يقول عملاؤنا؟" : "Ce que disent nos clients"}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayedTestimonials.map((testimonial, index) => {
            const name = language === "ar" && testimonial.name_ar ? testimonial.name_ar : testimonial.name;
            const role = language === "ar" && testimonial.role_ar ? testimonial.role_ar : testimonial.role;
            const content = language === "ar" && testimonial.content_ar ? testimonial.content_ar : testimonial.content;
            const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

            return (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300"
              >
                <Quote className="absolute top-4 end-4 h-8 w-8 text-primary/10" />

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    {testimonial.image_url ? (
                      <AvatarImage src={testimonial.image_url} alt={name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{name}</h4>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
