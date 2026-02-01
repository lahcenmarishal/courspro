import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Video, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
  currentNotes?: string;
  currentRecordingUrl?: string;
  onSessionEnded: () => void;
}

export function EndSessionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
  currentNotes = "",
  currentRecordingUrl = "",
  onSessionEnded,
}: EndSessionDialogProps) {
  const [recordingUrl, setRecordingUrl] = useState(currentRecordingUrl);
  const [notes, setNotes] = useState(currentNotes);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleEndSession = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ 
          status: "completed",
          recording_url: recordingUrl || null,
          notes: notes || null
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Séance terminée avec succès");
      onOpenChange(false);
      onSessionEnded();
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Erreur lors de la fin de la séance");
    } finally {
      setLoading(false);
    }
  };

  const recordingInstructions = [
    "Utilisez un logiciel de capture d'écran (OBS, Loom, Xbox Game Bar...)",
    "Une fois l'enregistrement terminé, uploadez-le sur Google Drive ou YouTube",
    "Faites un clic droit → 'Obtenir le lien' (Google Drive) ou copiez l'URL YouTube",
    "Collez le lien ci-dessous"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Terminer la séance
          </DialogTitle>
          <DialogDescription>
            {sessionTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Recording URL Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Lien d'enregistrement
            </Label>
            <Input
              placeholder="https://drive.google.com/... ou https://youtube.com/..."
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
            />
            
            {/* Instructions toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Masquer les instructions
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Comment ajouter un enregistrement ?
                </>
              )}
            </Button>

            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                      <Cloud className="h-4 w-4" />
                      Comment sauvegarder l'enregistrement
                    </div>
                    {recordingInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-blue-700 dark:text-blue-300">{instruction}</span>
                      </div>
                    ))}
                    <a 
                      href="https://drive.google.com/drive/my-drive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 underline mt-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ouvrir Google Drive
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label>Notes de séance (optionnel)</Label>
            <Textarea
              placeholder="Résumé de la séance, points abordés, devoirs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info message */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            💡 Vous pourrez toujours modifier ces informations plus tard en éditant la séance.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleEndSession}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {loading ? "Enregistrement..." : "Terminer la séance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
