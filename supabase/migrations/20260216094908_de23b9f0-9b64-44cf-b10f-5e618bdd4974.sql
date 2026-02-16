
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Teachers can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can delete their resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Anyone can view resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Admins can manage resources storage"
ON storage.objects FOR ALL
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));
