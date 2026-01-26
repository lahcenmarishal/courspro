
-- Fix RLS policies for homework table - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Students can view homework for their classes" ON public.homework;
CREATE POLICY "Students can view homework for their classes"
ON public.homework
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM student_enrollments se
    WHERE se.student_id = auth.uid()
      AND se.class_id = homework.class_id
  )
);

-- Fix RLS policies for resources table - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Students can view resources for their classes" ON public.resources;
CREATE POLICY "Students can view resources for their classes"
ON public.resources
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM student_enrollments se
    WHERE se.student_id = auth.uid()
      AND se.class_id = resources.class_id
  )
);

-- Fix RLS policies for grades table - ensure it's permissive
DROP POLICY IF EXISTS "Students can view their grades" ON public.grades;
CREATE POLICY "Students can view their grades"
ON public.grades
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Fix RLS policies for messages table - ensure it's permissive  
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
ON public.messages
FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());
