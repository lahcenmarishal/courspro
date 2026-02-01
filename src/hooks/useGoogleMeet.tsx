import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateMeetParams {
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
}

interface CreateMeetResult {
  success: boolean;
  meetLink?: string;
  eventId?: string;
  eventHtmlLink?: string;
  needsAuth?: boolean;
  authUrl?: string;
  error?: string;
}

export function useGoogleMeet() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const createMeetLink = useCallback(async (params: CreateMeetParams): Promise<CreateMeetResult> => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Non authentifié");
      }

      const response = await supabase.functions.invoke("create-google-meet", {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data as CreateMeetResult;

      if (data.needsAuth && data.authUrl) {
        // Open OAuth popup
        setIsAuthenticating(true);
        
        return new Promise((resolve) => {
          const width = 500;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          
          const popup = window.open(
            data.authUrl,
            "google-oauth",
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
          );

          const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === "google-oauth-success") {
              window.removeEventListener("message", handleMessage);
              setIsAuthenticating(false);
              popup?.close();
              
              // Retry creating the meet link
              toast.success("Google Calendar connecté! Création du lien...");
              const retryResult = await createMeetLink(params);
              resolve(retryResult);
            } else if (event.data?.type === "google-oauth-error") {
              window.removeEventListener("message", handleMessage);
              setIsAuthenticating(false);
              popup?.close();
              toast.error("Erreur lors de l'autorisation Google");
              resolve({ success: false, error: event.data.error });
            }
          };

          window.addEventListener("message", handleMessage);

          // Check if popup was closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              window.removeEventListener("message", handleMessage);
              setIsAuthenticating(false);
              resolve({ success: false, error: "Fenêtre fermée" });
            }
          }, 1000);
        });
      }

      if (data.success && data.meetLink) {
        toast.success("Lien Google Meet créé avec succès!");
        return data;
      }

      throw new Error(data.error || "Erreur inconnue");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création du lien";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createMeetLink,
    isLoading,
    isAuthenticating,
  };
}
