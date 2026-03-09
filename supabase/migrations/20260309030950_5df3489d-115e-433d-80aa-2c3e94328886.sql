-- Create testimonials table for managing customer testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  role TEXT NOT NULL,
  role_ar TEXT,
  content TEXT NOT NULL,
  content_ar TEXT,
  image_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published testimonials"
  ON public.testimonials FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for testimonial images
INSERT INTO storage.buckets (id, name, public) VALUES ('testimonials', 'testimonials', true);

-- Storage policies for testimonial images
CREATE POLICY "Anyone can view testimonial images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'testimonials');

CREATE POLICY "Admins can upload testimonial images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'testimonials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonial images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'testimonials' AND has_role(auth.uid(), 'admin'::app_role));