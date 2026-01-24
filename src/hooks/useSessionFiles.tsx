import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface SessionFile {
  id: string;
  session_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export function useSessionFiles(sessionId: string | null) {
  const { user } = useAuth();
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_files")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles((data as SessionFile[]) || []);
    } catch (error) {
      console.error("Error fetching session files:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const uploadFile = useCallback(async (file: File) => {
    if (!sessionId || !user) {
      toast.error("Session ou utilisateur non trouvé");
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}/${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("session-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("session-files")
        .getPublicUrl(fileName);

      // Create database record
      const { data, error } = await supabase
        .from("session_files")
        .insert({
          session_id: sessionId,
          uploaded_by: user.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size
        })
        .select()
        .single();

      if (error) throw error;

      setFiles(prev => [data as SessionFile, ...prev]);
      toast.success("Fichier partagé avec succès");
      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors du partage du fichier");
      return null;
    } finally {
      setUploading(false);
    }
  }, [sessionId, user]);

  const deleteFile = useCallback(async (fileId: string, fileUrl: string) => {
    try {
      // Extract path from URL
      const path = fileUrl.split("/session-files/")[1];
      
      if (path) {
        await supabase.storage
          .from("session-files")
          .remove([path]);
      }

      const { error } = await supabase
        .from("session_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success("Fichier supprimé");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  return {
    files,
    loading,
    uploading,
    fetchFiles,
    uploadFile,
    deleteFile
  };
}
