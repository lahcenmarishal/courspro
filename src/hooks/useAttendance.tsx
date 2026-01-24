import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useAttendance() {
  const { user, role } = useAuth();

  const recordJoin = useCallback(async (sessionId: string) => {
    if (!user || role !== "student") return null;

    try {
      // Check if attendance record already exists
      const { data: existing } = await supabase
        .from("attendances")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", user.id)
        .single();

      if (existing) {
        // Update existing record with new join time
        const { error } = await supabase
          .from("attendances")
          .update({
            joined_at: new Date().toISOString(),
            is_present: true,
            left_at: null
          })
          .eq("id", existing.id);

        if (error) throw error;
        return existing.id;
      }

      // Create new attendance record
      const { data, error } = await supabase
        .from("attendances")
        .insert({
          session_id: sessionId,
          student_id: user.id,
          is_present: true,
          joined_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (error) throw error;
      
      toast.success("Présence enregistrée automatiquement");
      return data?.id;
    } catch (error) {
      console.error("Error recording attendance:", error);
      return null;
    }
  }, [user, role]);

  const recordLeave = useCallback(async (sessionId: string) => {
    if (!user || role !== "student") return;

    try {
      const { error } = await supabase
        .from("attendances")
        .update({
          left_at: new Date().toISOString()
        })
        .eq("session_id", sessionId)
        .eq("student_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error recording leave:", error);
    }
  }, [user, role]);

  const getSessionAttendance = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("attendances")
        .select(`
          id,
          student_id,
          is_present,
          joined_at,
          left_at,
          created_at
        `)
        .eq("session_id", sessionId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  }, []);

  return {
    recordJoin,
    recordLeave,
    getSessionAttendance
  };
}
