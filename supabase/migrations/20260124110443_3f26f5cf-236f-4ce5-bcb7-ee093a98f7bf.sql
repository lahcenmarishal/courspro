-- Permettre aux étudiants de voir toutes les séances (accès libre)
DROP POLICY IF EXISTS "Students can view all sessions" ON public.sessions;
CREATE POLICY "Students can view all sessions"
ON public.sessions
FOR SELECT
USING (has_role(auth.uid(), 'student'::app_role));

-- Permettre aux étudiants de créer leur propre présence pour n'importe quelle séance
DROP POLICY IF EXISTS "Students can record their attendance" ON public.attendances;
CREATE POLICY "Students can record their attendance"
ON public.attendances
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'student'::app_role) 
  AND student_id = auth.uid()
);

-- Permettre aux étudiants de mettre à jour leur propre présence
DROP POLICY IF EXISTS "Students can update their attendance" ON public.attendances;
CREATE POLICY "Students can update their attendance"
ON public.attendances
FOR UPDATE
USING (student_id = auth.uid());

-- Permettre aux étudiants de voir les fichiers de toutes les séances
DROP POLICY IF EXISTS "Students can view all session files" ON public.session_files;
CREATE POLICY "Students can view all session files"
ON public.session_files
FOR SELECT
USING (has_role(auth.uid(), 'student'::app_role));

-- Permettre aux étudiants de partager des fichiers dans les séances
DROP POLICY IF EXISTS "Students can upload session files" ON public.session_files;
CREATE POLICY "Students can upload session files"
ON public.session_files
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'student'::app_role) 
  AND uploaded_by = auth.uid()
);