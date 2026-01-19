import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect } from "react";

const PricingPage = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `${t("pricing.pageTitle")} | CoursPro`;
  }, [t]);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <Navbar />
      
      <main className="pt-16">
        <Pricing />
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage;
