import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Attendance {
  id: string;
  student_id: string;
  is_present: boolean;
  joined_at: string | null;
  left_at: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface SessionAttendanceListProps {
  sessionId: string;
}

export function SessionAttendanceList({ sessionId }: SessionAttendanceListProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const { data, error } = await supabase
          .from("attendances")
          .select("id, student_id, is_present, joined_at, left_at")
          .eq("session_id", sessionId);

        if (error) throw error;

        // Fetch profiles for students
        if (data && data.length > 0) {
          const studentIds = data.map(a => a.student_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, avatar_url")
            .in("user_id", studentIds);

          const attendancesWithProfiles = data.map(attendance => ({
            ...attendance,
            profile: profiles?.find(p => p.user_id === attendance.student_id)
          }));

          setAttendances(attendancesWithProfiles);
        } else {
          setAttendances([]);
        }
      } catch (error) {
        console.error("Error fetching attendances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`attendances-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendances',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          fetchAttendances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "HH:mm", { locale: fr });
  };

  const calculateDuration = (joinedAt: string | null, leftAt: string | null) => {
    if (!joinedAt) return null;
    const start = new Date(joinedAt);
    const end = leftAt ? new Date(leftAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (attendances.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune présence enregistrée</p>
      </div>
    );
  }

  const presentCount = attendances.filter(a => a.is_present).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Présences</span>
        </div>
        <Badge variant="secondary">
          {presentCount}/{attendances.length} présents
        </Badge>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-2">
          {attendances.map((attendance) => (
            <div
              key={attendance.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {attendance.profile?.avatar_url ? (
                  <img 
                    src={attendance.profile.avatar_url} 
                    alt="" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-primary">
                    {attendance.profile?.first_name?.[0]}{attendance.profile?.last_name?.[0]}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attendance.profile?.first_name} {attendance.profile?.last_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {attendance.joined_at && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>Rejoint à {formatTime(attendance.joined_at)}</span>
                      {attendance.left_at && (
                        <span>• Parti à {formatTime(attendance.left_at)}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {calculateDuration(attendance.joined_at, attendance.left_at) && (
                  <Badge variant="outline" className="text-xs">
                    {calculateDuration(attendance.joined_at, attendance.left_at)}
                  </Badge>
                )}
                {attendance.is_present ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
