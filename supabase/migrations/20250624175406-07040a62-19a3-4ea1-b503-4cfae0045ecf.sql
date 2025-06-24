
-- Phase 1: Critical RLS Policy Fixes (Fixed version)

-- Clean up duplicate admin_logs policies and add proper ones
DROP POLICY IF EXISTS "Only admins can view admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins can create admin logs" ON public.admin_logs;

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

-- Clean up duplicate featured_videos policies
DROP POLICY IF EXISTS "Anyone can view published videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Anyone can view featured videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.featured_videos;

CREATE POLICY "Anyone can view featured videos" 
  ON public.featured_videos 
  FOR SELECT 
  USING (is_featured = true);

CREATE POLICY "Admins can manage all videos" 
  ON public.featured_videos 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Clean up blogs policies and add proper author/admin access
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can view their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can manage their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage all blogs" ON public.blogs;

CREATE POLICY "Anyone can view published blogs" 
  ON public.blogs 
  FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Authors can view their own blogs" 
  ON public.blogs 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own blogs" 
  ON public.blogs 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all blogs" 
  ON public.blogs 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add missing RLS policies for gd_registrations
ALTER TABLE public.gd_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own registrations" ON public.gd_registrations;
DROP POLICY IF EXISTS "Users can create their own registrations" ON public.gd_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.gd_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.gd_registrations;

CREATE POLICY "Users can view their own registrations" 
  ON public.gd_registrations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" 
  ON public.gd_registrations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
  ON public.gd_registrations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" 
  ON public.gd_registrations 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add missing RLS policies for group_discussions
ALTER TABLE public.group_discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active group discussions" ON public.group_discussions;
DROP POLICY IF EXISTS "Admins can manage all group discussions" ON public.group_discussions;
DROP POLICY IF EXISTS "Moderators can view assigned discussions" ON public.group_discussions;

CREATE POLICY "Anyone can view active group discussions" 
  ON public.group_discussions 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage all group discussions" 
  ON public.group_discussions 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Moderators can view assigned discussions" 
  ON public.group_discussions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = moderator_id OR auth.uid() = created_by);

-- Add missing RLS policies for media_content
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published media" ON public.media_content;
DROP POLICY IF EXISTS "Creators can view their own media" ON public.media_content;
DROP POLICY IF EXISTS "Admins can manage all media" ON public.media_content;
DROP POLICY IF EXISTS "Creators can manage their own media" ON public.media_content;

CREATE POLICY "Anyone can view published media" 
  ON public.media_content 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Creators can view their own media" 
  ON public.media_content 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all media" 
  ON public.media_content 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Creators can manage their own media" 
  ON public.media_content 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Add missing RLS policies for predefined_tags
DROP POLICY IF EXISTS "All authenticated users can view predefined tags" ON public.predefined_tags;
DROP POLICY IF EXISTS "Anyone can view predefined tags" ON public.predefined_tags;
DROP POLICY IF EXISTS "Only admins can manage predefined tags" ON public.predefined_tags;

CREATE POLICY "Anyone can view predefined tags" 
  ON public.predefined_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage predefined tags" 
  ON public.predefined_tags 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add missing RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add missing RLS policies for reward_points
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reward points" ON public.reward_points;
DROP POLICY IF EXISTS "Anyone can view reward points for leaderboard" ON public.reward_points;
DROP POLICY IF EXISTS "Only admins can create reward points" ON public.reward_points;
DROP POLICY IF EXISTS "Only admins can delete reward points" ON public.reward_points;

CREATE POLICY "Users can view their own reward points" 
  ON public.reward_points 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reward points for leaderboard" 
  ON public.reward_points 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create reward points" 
  ON public.reward_points 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete reward points" 
  ON public.reward_points 
  FOR DELETE 
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add missing RLS policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add validation constraints for security (only add if they don't exist)
DO $$ 
BEGIN
    -- Add points range constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_points_range'
    ) THEN
        ALTER TABLE public.reward_points 
        ADD CONSTRAINT valid_points_range 
        CHECK (points >= 0 AND points <= 10000);
    END IF;

    -- Add slot capacity constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_slot_capacity'
    ) THEN
        ALTER TABLE public.group_discussions 
        ADD CONSTRAINT valid_slot_capacity 
        CHECK (slot_capacity > 0 AND slot_capacity <= 100);
    END IF;

    -- Add rating range constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_rating_range'
    ) THEN
        ALTER TABLE public.testimonials 
        ADD CONSTRAINT valid_rating_range 
        CHECK (rating >= 1 AND rating <= 5);
    END IF;

    -- Add blog title length constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_title_length'
    ) THEN
        ALTER TABLE public.blogs 
        ADD CONSTRAINT valid_title_length 
        CHECK (char_length(title) <= 200);
    END IF;

    -- Add blog content length constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_content_length'
    ) THEN
        ALTER TABLE public.blogs 
        ADD CONSTRAINT valid_content_length 
        CHECK (char_length(content) <= 50000);
    END IF;

    -- Add testimonial content length constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'testimonials_valid_content_length'
    ) THEN
        ALTER TABLE public.testimonials 
        ADD CONSTRAINT testimonials_valid_content_length 
        CHECK (char_length(content) <= 2000);
    END IF;
END $$;
