-- Créer une table pour les fichiers de séance (partage pendant les cours)
CREATE TABLE public.session_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;

-- Admins can manage all session files
CREATE POLICY "Admins can manage session files"
ON public.session_files
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can manage files for their sessions
CREATE POLICY "Teachers can manage files for their sessions"
ON public.session_files
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM sessions s
    JOIN schedule_slots ss ON s.schedule_slot_id = ss.id
    JOIN teacher_assignments ta ON ss.assignment_id = ta.id
    WHERE s.id = session_files.session_id
    AND ta.teacher_id = auth.uid()
  )
);

-- Students can view files for sessions in their classes
CREATE POLICY "Students can view session files"
ON public.session_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions s
    JOIN schedule_slots ss ON s.schedule_slot_id = ss.id
    JOIN teacher_assignments ta ON ss.assignment_id = ta.id
    JOIN student_enrollments se ON se.class_id = ta.class_id
    WHERE s.id = session_files.session_id
    AND se.student_id = auth.uid()
  )
);

-- Créer le bucket pour les fichiers de séance
INSERT INTO storage.buckets (id, name, public) VALUES ('session-files', 'session-files', true);

-- Policies pour le bucket session-files
CREATE POLICY "Anyone can view session files"
ON storage.objects FOR SELECT
USING (bucket_id = 'session-files');

CREATE POLICY "Authenticated users can upload session files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'session-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own session files"
ON storage.objects FOR DELETE
USING (bucket_id = 'session-files' AND auth.uid()::text = (storage.foldername(name))[1]);