import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JitsiMeetWidgetProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
  subject?: string;
  className?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiMeetWidget({ 
  roomName, 
  displayName, 
  onClose, 
  subject = "Cours en ligne",
  className = ""
}: JitsiMeetWidgetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi API"));
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        // Extract room name from full URL if needed
        const extractedRoomName = roomName.includes("meet.jit.si/") 
          ? roomName.split("meet.jit.si/")[1] 
          : roomName;

        const domain = "meet.jit.si";
        const options = {
          roomName: extractedRoomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            defaultLanguage: "fr",
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'participants-pane',
              'tileview',
              'select-background',
              'download',
              'help',
              'mute-everyone',
              'security'
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        jitsiApiRef.current.addListener("videoConferenceJoined", () => {
          setIsLoading(false);
        });

        jitsiApiRef.current.addListener("participantJoined", () => {
          setParticipantCount(prev => prev + 1);
        });

        jitsiApiRef.current.addListener("participantLeft", () => {
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        jitsiApiRef.current.addListener("audioMuteStatusChanged", (data: { muted: boolean }) => {
          setIsMuted(data.muted);
        });

        jitsiApiRef.current.addListener("videoMuteStatusChanged", (data: { muted: boolean }) => {
          setIsVideoOff(data.muted);
        });

        jitsiApiRef.current.addListener("readyToClose", () => {
          onClose();
        });

      } catch (error) {
        console.error("Error initializing Jitsi:", error);
        setIsLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName, displayName, onClose]);

  const toggleMute = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleAudio");
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleVideo");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleHangup = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("hangup");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed ${isFullscreen ? 'inset-0 z-50' : 'bottom-4 right-4 w-[800px] h-[600px] z-40'} ${className}`}
      >
        <Card className={`w-full h-full flex flex-col overflow-hidden shadow-2xl border-2 border-primary/20 ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold">{subject}</span>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <Users className="h-4 w-4" />
                <span>{participantCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-red-500/80"
                onClick={handleHangup}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Jitsi Container */}
          <div className="flex-1 relative bg-gray-900">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Connexion à la salle...</p>
                  <p className="text-sm text-gray-400 mt-1">Préparation de votre vidéoconférence</p>
                </div>
              </div>
            )}
            <div ref={jitsiContainerRef} className="w-full h-full" />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
