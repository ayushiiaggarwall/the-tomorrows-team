
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view registration counts for GDs" ON public.gd_registrations;
DROP POLICY IF EXISTS "Users can create their own registrations" ON public.gd_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.gd_registrations;

-- Enable RLS on gd_registrations table if not already enabled
ALTER TABLE public.gd_registrations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all registrations for counting purposes
-- This is essential for displaying accurate spot counts to all users
CREATE POLICY "All users can view registration counts" 
  ON public.gd_registrations 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to insert their own registrations
CREATE POLICY "Users can insert own registrations" 
  ON public.gd_registrations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
