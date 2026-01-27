import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, Users, Upload, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAttendance } from "@/hooks/useAttendance";
import { useSessionFiles, SessionFile } from "@/hooks/useSessionFiles";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RecordingReminder } from "./RecordingReminder";
interface JitsiMeetWidgetProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
  subject?: string;
  sessionId?: string;
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
  sessionId,
  className = ""
}: JitsiMeetWidgetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFiles, setShowFiles] = useState(false);
  const [showRecordingReminder, setShowRecordingReminder] = useState(true);
  const { recordJoin, recordLeave } = useAttendance();
  const { files, loading: filesLoading, uploading, fetchFiles, uploadFile, deleteFile } = useSessionFiles(sessionId || null);

  // Record attendance when joining
  useEffect(() => {
    if (sessionId) {
      recordJoin(sessionId);
      fetchFiles();
    }

    return () => {
      if (sessionId) {
        recordLeave(sessionId);
      }
    };
  }, [sessionId, recordJoin, recordLeave, fetchFiles]);

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

        // Validate room name
        let extractedRoomName = roomName;
        if (roomName.includes("meet.jit.si/")) {
          extractedRoomName = roomName.split("meet.jit.si/")[1];
        } else if (roomName.includes("://")) {
          // Try to extract room from any URL format
          const urlParts = roomName.split("/");
          extractedRoomName = urlParts[urlParts.length - 1] || roomName;
        }

        // Clean room name - remove query params and special chars
        extractedRoomName = extractedRoomName.split("?")[0].split("#")[0];
        
        if (!extractedRoomName || extractedRoomName.length < 3) {
          console.error("Invalid room name:", roomName);
          setIsLoading(false);
          return;
        }

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
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat', 'recording', 'livestreaming',
              'etherpad', 'sharedvideo', 'settings', 'raisehand', 'videoquality',
              'filmstrip', 'participants-pane', 'tileview', 'select-background',
              'download', 'help', 'mute-everyone', 'security'
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

        // Set timeout to stop loading after 15 seconds even if not connected
        const loadingTimeout = setTimeout(() => {
          setIsLoading(false);
        }, 15000);

        jitsiApiRef.current.addListener("videoConferenceJoined", () => {
          clearTimeout(loadingTimeout);
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
          clearTimeout(loadingTimeout);
          onClose();
        });

        // Handle iframe load to detect when Jitsi UI is ready
        jitsiApiRef.current.addListener("browserSupport", () => {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
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

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [uploadFile]);

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️";
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed ${isFullscreen ? 'inset-0 z-50' : 'bottom-4 right-4 w-[900px] h-[650px] z-40'} ${className}`}
      >
        <Card className={`w-full h-full flex overflow-hidden shadow-2xl border-2 border-primary/20 ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}>
          {/* Main video area */}
          <div className="flex-1 flex flex-col">
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
                  className={`h-8 w-8 text-primary-foreground hover:bg-white/20 ${showFiles ? 'bg-white/20' : ''}`}
                  onClick={() => setShowFiles(!showFiles)}
                  title="Fichiers partagés"
                >
                  <FileText className="h-4 w-4" />
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

            {/* Recording Reminder Banner */}
            {showRecordingReminder && !isLoading && (
              <RecordingReminder 
                variant="banner" 
                onDismiss={() => setShowRecordingReminder(false)} 
              />
            )}

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
          </div>

          {/* Files sidebar */}
          {showFiles && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l bg-background flex flex-col"
            >
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Fichiers partagés</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowFiles(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Envoi..." : "Partager un fichier"}
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-2">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun fichier partagé</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <a 
                          href={file.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-start gap-2"
                        >
                          <span className="text-lg flex-shrink-0">
                            {typeof getFileIcon(file.file_type) === 'string' 
                              ? getFileIcon(file.file_type) 
                              : <FileText className="h-4 w-4" />
                            }
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)} • {format(new Date(file.created_at), "HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                          onClick={() => deleteFile(file.id, file.file_url)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
