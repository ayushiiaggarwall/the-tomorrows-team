
-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can view published videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Only admins can view admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins can create admin logs" ON public.admin_logs;

-- Create security definer function for admin check to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = _user_id),
    FALSE
  )
$function$;

-- Update testimonials RLS policies to use the security definer function
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;

CREATE POLICY "Anyone can view approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (is_approved = true OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own testimonials" 
  ON public.testimonials 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for other tables that were missing them
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published videos" 
  ON public.featured_videos 
  FOR SELECT 
  USING (is_featured = true);

CREATE POLICY "Admins can manage videos" 
  ON public.featured_videos 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs" 
  ON public.blogs 
  FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins can manage blogs" 
  ON public.blogs 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Enable RLS for admin logs and restrict access
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin logs" 
  ON public.admin_logs 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can create admin logs" 
  ON public.admin_logs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
