-- Allow direct sessions without schedule dependency
-- Make schedule_slot_id nullable to support ad-hoc sessions
ALTER TABLE public.sessions 
ALTER COLUMN schedule_slot_id DROP NOT NULL;

-- Add columns for direct sessions (when no schedule slot is used)
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id),
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id),
ADD COLUMN IF NOT EXISTS teacher_id UUID,
ADD COLUMN IF NOT EXISTS is_direct BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Allow teachers to create direct sessions
CREATE POLICY "Teachers can create direct sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND teacher_id = auth.uid() 
  AND is_direct = true
);

-- Allow teachers to update their direct sessions
CREATE POLICY "Teachers can update their direct sessions" 
ON public.sessions 
FOR UPDATE 
USING (
  teacher_id = auth.uid() 
  AND is_direct = true
);

-- Allow teachers to delete their direct sessions
CREATE POLICY "Teachers can delete their direct sessions" 
ON public.sessions 
FOR DELETE 
USING (
  teacher_id = auth.uid() 
  AND is_direct = true
);