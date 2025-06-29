
-- Create admin_settings table to store configurable point values and announcements
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_attendance INTEGER NOT NULL DEFAULT 10,
  points_per_best_speaker INTEGER NOT NULL DEFAULT 20,
  points_per_referral INTEGER NOT NULL DEFAULT 10,
  points_per_moderation INTEGER NOT NULL DEFAULT 15,
  points_per_perfect_attendance INTEGER NOT NULL DEFAULT 50,
  site_announcement TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (
  points_per_attendance,
  points_per_best_speaker,
  points_per_referral,
  points_per_moderation,
  points_per_perfect_attendance,
  site_announcement
) VALUES (
  10,
  20,
  10,
  15,
  50,
  ''
);

-- Add RLS policies for admin_settings (only admins can read/write)
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin settings" 
  ON public.admin_settings 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update admin settings" 
  ON public.admin_settings 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin settings" 
  ON public.admin_settings 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));
