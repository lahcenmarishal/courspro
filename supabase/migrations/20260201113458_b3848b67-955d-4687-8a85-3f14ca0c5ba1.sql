-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage all tokens" ON public.user_google_tokens;

-- Create a proper policy for admins to manage tokens
CREATE POLICY "Admins can manage all tokens"
ON public.user_google_tokens
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));