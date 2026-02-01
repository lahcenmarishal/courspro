import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  X, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RecordingReminderProps {
  variant?: "banner" | "card";
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function RecordingReminder({ 
  variant = "banner", 
  onDismiss,
  showDismiss = true 
}: RecordingReminderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const steps = [
    "Google Meet n'enregistre pas automatiquement - utilisez un logiciel de capture d'écran",
    "Windows: Win + G pour ouvrir Xbox Game Bar, puis cliquez sur 'Enregistrer'",
    "Mac: Cmd + Shift + 5 pour ouvrir l'outil de capture d'écran",
    "Ou utilisez OBS Studio (gratuit) ou Loom pour des enregistrements professionnels",
    "Une fois terminé, uploadez l'enregistrement sur Google Drive ou YouTube et copiez le lien"
  ];

  if (variant === "card") {
    return (
      <Card className="p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Video className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              📹 Pensez à enregistrer vos séances !
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Capturez vos cours Google Meet pour les partager avec vos élèves.
            </p>
            
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-amber-700 dark:text-amber-300 hover:text-amber-800 hover:bg-amber-500/20 p-0 h-auto"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Masquer les instructions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Voir comment enregistrer
                </>
              )}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-amber-700 dark:text-amber-300">{step}</span>
                      </div>
                    ))}
                  </div>
                  <a 
                    href="https://support.google.com/meet/answer/9308681"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-amber-600 hover:text-amber-700 underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Aide Google Meet
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {showDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Banner variant for Meet sessions
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
    >
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">
            📹 Pensez à enregistrer votre séance !
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-white/20 text-xs h-6 px-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Masquer" : "Comment faire ?"}
          </Button>
        </div>
        {showDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={handleDismiss}
            title="J'ai compris"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/20"
          >
            <div className="px-4 py-3 space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-white/90">{step}</span>
                </div>
              ))}
              <a 
                href="https://support.google.com/meet/answer/9308681"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-white/80 hover:text-white underline"
              >
                <ExternalLink className="h-3 w-3" />
                Aide Google Meet
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
