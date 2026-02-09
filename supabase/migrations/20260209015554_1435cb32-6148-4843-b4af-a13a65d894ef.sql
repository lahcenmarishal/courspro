-- Allow teachers to create regular (non-direct) sessions via their schedule slots
CREATE POLICY "Teachers can create scheduled sessions"
ON public.sessions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND (is_direct IS NOT TRUE)
  AND EXISTS (
    SELECT 1
    FROM schedule_slots ss
    JOIN teacher_assignments ta ON ss.assignment_id = ta.id
    WHERE ss.id = sessions.schedule_slot_id
      AND ta.teacher_id = auth.uid()
  )
);