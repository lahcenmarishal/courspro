-- Add Arabic translation columns to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_title_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ar TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.blog_posts.title_ar IS 'Arabic translation of the title';
COMMENT ON COLUMN public.blog_posts.excerpt_ar IS 'Arabic translation of the excerpt';
COMMENT ON COLUMN public.blog_posts.content_ar IS 'Arabic translation of the content';
COMMENT ON COLUMN public.blog_posts.meta_title_ar IS 'Arabic translation of the meta title';
COMMENT ON COLUMN public.blog_posts.meta_description_ar IS 'Arabic translation of the meta description';