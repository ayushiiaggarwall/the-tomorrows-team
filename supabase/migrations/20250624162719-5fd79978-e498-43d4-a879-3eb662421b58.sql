
-- First, delete duplicate testimonials, keeping only the most recent one per user
WITH ranked_testimonials AS (
  SELECT id, user_id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.testimonials
)
DELETE FROM public.testimonials 
WHERE id IN (
  SELECT id FROM ranked_testimonials WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.testimonials 
ADD CONSTRAINT unique_user_testimonial 
UNIQUE (user_id);

-- Drop all existing policies and recreate them
DROP POLICY IF EXISTS "Authenticated users can create testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can update their own unapproved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;

-- Create the new policies
CREATE POLICY "Users can create one testimonial" 
  ON public.testimonials 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (
      SELECT 1 FROM public.testimonials 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can view their own testimonials" 
  ON public.testimonials 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);
