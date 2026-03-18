import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { RoleShowcase } from "@/components/landing/RoleShowcase";
import { Founders } from "@/components/landing/Founders";
import { Pricing } from "@/components/landing/Pricing";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <RoleShowcase />
        <section id="founders">
          <Founders />
        </section>
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
