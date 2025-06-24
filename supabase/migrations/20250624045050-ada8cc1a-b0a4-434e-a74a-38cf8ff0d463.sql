
-- Create table for featured videos (sample GD videos)
CREATE TABLE public.featured_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user testimonials/reviews
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for featured_videos
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published videos
CREATE POLICY "Anyone can view featured videos" 
  ON public.featured_videos 
  FOR SELECT 
  USING (true);

-- Policy: Only admins can manage videos (will be implemented via admin interface)
CREATE POLICY "Admins can manage featured videos" 
  ON public.featured_videos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Add RLS policies for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (is_approved = true);

-- Policy: Users can create their own testimonials
CREATE POLICY "Users can create testimonials" 
  ON public.testimonials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own testimonials (before approval)
CREATE POLICY "Users can update own testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  USING (auth.uid() = user_id AND is_approved = false);

-- Policy: Admins can manage all testimonials
CREATE POLICY "Admins can manage all testimonials" 
  ON public.testimonials 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Update media_content table to include video type and featured status
ALTER TABLE public.media_content 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_duration TEXT,
ADD COLUMN IF NOT EXISTS participant_count INTEGER;
