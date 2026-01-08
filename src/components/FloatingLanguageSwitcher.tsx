import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export const FloatingLanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
      aria-label={language === 'fr' ? 'Changer la langue en arabe' : 'تغيير اللغة إلى الفرنسية'}
    >
      <Globe className="h-5 w-5" />
      <span className="font-semibold text-sm">
        {language === 'fr' ? 'العربية' : 'FR'}
      </span>
    </motion.button>
  );
};
