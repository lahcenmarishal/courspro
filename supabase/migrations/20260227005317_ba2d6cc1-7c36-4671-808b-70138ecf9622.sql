
-- Add phone and selected_plan columns if not already present
-- phone already exists, selected_plan is new
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_plan text;
