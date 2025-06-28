
-- Create community_announcements table
CREATE TABLE public.community_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.community_announcements ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to read active announcements
CREATE POLICY "Anyone can view active announcements" 
  ON public.community_announcements 
  FOR SELECT 
  USING (is_active = true);

-- Policy to allow admins to manage announcements
CREATE POLICY "Admins can manage announcements" 
  ON public.community_announcements 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Enable realtime for community_announcements
ALTER TABLE public.community_announcements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_announcements;
