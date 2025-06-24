
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can create testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can update own testimonials" ON public.testimonials;

-- Create corrected policies
CREATE POLICY "Authenticated users can create testimonials" 
  ON public.testimonials 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unapproved testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id AND is_approved = false);
