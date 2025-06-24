
-- Add missing SELECT policy for users to view their own testimonials
CREATE POLICY "Users can view their own testimonials" 
  ON public.testimonials 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);
