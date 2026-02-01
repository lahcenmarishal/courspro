-- Create table to store Google OAuth tokens
CREATE TABLE public.user_google_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tokens (for the edge function to check)
CREATE POLICY "Users can view their own tokens"
ON public.user_google_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own tokens"
ON public.user_google_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update their own tokens"
ON public.user_google_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Service role can manage all tokens (for edge functions)
CREATE POLICY "Service role can manage all tokens"
ON public.user_google_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_google_tokens_updated_at
  BEFORE UPDATE ON public.user_google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();