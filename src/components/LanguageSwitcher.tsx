import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'fr' ? 'العربية' : 'Français'}</span>
    </Button>
  );
};
