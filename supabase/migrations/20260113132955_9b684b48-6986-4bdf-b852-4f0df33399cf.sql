-- Add policies for teachers to upload blog images and files
CREATE POLICY "Teachers can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can update blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can delete blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can upload blog files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-files' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can update blog files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog-files' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can delete blog files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog-files' AND has_role(auth.uid(), 'teacher'::app_role));