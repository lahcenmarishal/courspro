import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const TestimonialCard = ({ testimonial, index, isArabic }: { testimonial: Testimonial; index: number; isArabic: boolean }) => {
  const name = isArabic && testimonial.name_ar ? testimonial.name_ar : testimonial.name;
  const role = isArabic && testimonial.role_ar ? testimonial.role_ar : testimonial.role;
  const content = isArabic && testimonial.content_ar ? testimonial.content_ar : testimonial.content;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`h-full ${testimonial.is_featured ? 'border-primary shadow-lg' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`}
              />
            ))}
          </div>
          
          <div className="relative mb-6">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
            <p className="text-muted-foreground leading-relaxed pl-6">
              {content}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.image_url || undefined} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TestimonialsPage = () => {
  const { t, language } = useLanguage();
  const { data: testimonials, isLoading } = useTestimonials(true);
  const isArabic = language === 'ar';

  useEffect(() => {
    document.title = `${isArabic ? 'آراء العملاء' : 'Témoignages'} | CoursPro`;
  }, [isArabic]);

  const featuredTestimonials = testimonials?.filter(t => t.is_featured) || [];
  const regularTestimonials = testimonials?.filter(t => !t.is_featured) || [];

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              <Star className="h-4 w-4" />
              {isArabic ? 'آراء العملاء' : 'Témoignages'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {isArabic ? 'ماذا يقول عملاؤنا' : 'Ce que disent'}{" "}
              <span className="gradient-text">{isArabic ? '' : 'nos clients'}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {isArabic 
                ? 'اكتشف آراء أولياء الأمور والطلاب الذين يثقون بنا لتعليم أبنائهم'
                : 'Découvrez les avis des parents et élèves qui nous font confiance pour l\'éducation de leurs enfants'}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <>
              {/* Featured testimonials */}
              {featuredTestimonials.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {isArabic ? 'شهادات مميزة' : 'Témoignages en vedette'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredTestimonials.map((testimonial, index) => (
                      <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        index={index}
                        isArabic={isArabic}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular testimonials */}
              {regularTestimonials.length > 0 && (
                <div>
                  {featuredTestimonials.length > 0 && (
                    <h2 className="text-2xl font-bold mb-6 text-center">
                      {isArabic ? 'المزيد من الآراء' : 'Plus de témoignages'}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularTestimonials.map((testimonial, index) => (
                      <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        index={index}
                        isArabic={isArabic}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Quote className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {isArabic ? 'لا توجد شهادات متاحة حالياً' : 'Aucun témoignage disponible pour le moment'}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestimonialsPage;
