
-- Fix infinite recursion in testimonials RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can create one testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Users can update their own testimonials" ON public.testimonials;

-- Create new policies that don't cause recursion
CREATE POLICY "Anyone can view approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can view their own testimonials" 
  ON public.testimonials 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create testimonials" 
  ON public.testimonials 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
