
-- Add new columns to the profiles table for additional user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create a table for predefined tags that users can choose from
CREATE TABLE IF NOT EXISTS public.predefined_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some predefined tags (only if table is empty)
INSERT INTO public.predefined_tags (name, category) 
SELECT * FROM (VALUES
  ('Leadership', 'Skills'),
  ('Communication', 'Skills'),
  ('Problem Solving', 'Skills'),
  ('Critical Thinking', 'Skills'),
  ('Team Player', 'Personality'),
  ('Creative', 'Personality'),
  ('Analytical', 'Personality'),
  ('Organized', 'Personality'),
  ('Technology', 'Interests'),
  ('Business', 'Interests'),
  ('Healthcare', 'Interests'),
  ('Education', 'Interests'),
  ('Finance', 'Interests'),
  ('Marketing', 'Interests'),
  ('Public Speaking', 'Skills'),
  ('Negotiation', 'Skills'),
  ('Research', 'Skills'),
  ('Writing', 'Skills')
) AS t(name, category)
WHERE NOT EXISTS (SELECT 1 FROM public.predefined_tags LIMIT 1);

-- Enable RLS on predefined_tags (make it readable by all authenticated users)
ALTER TABLE public.predefined_tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read predefined tags
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'predefined_tags' 
    AND policyname = 'All authenticated users can view predefined tags'
  ) THEN
    CREATE POLICY "All authenticated users can view predefined tags"
      ON public.predefined_tags
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Enable realtime for reward_points table
ALTER TABLE public.reward_points REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_points;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
