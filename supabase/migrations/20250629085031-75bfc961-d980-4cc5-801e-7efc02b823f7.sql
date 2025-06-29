
-- Allow all authenticated users to read admin settings (but only admins can modify them)
DROP POLICY IF EXISTS "Admins can view admin settings" ON public.admin_settings;

CREATE POLICY "All authenticated users can view admin settings" 
  ON public.admin_settings 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to read profiles for leaderboard display
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view reward points for leaderboard
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view all reward points" 
  ON public.reward_points 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Keep existing policies for updates/inserts (only admins can modify admin settings)
-- Keep existing policies for reward points modifications (only admins can insert/update)
CREATE POLICY "Admins can insert reward points" 
  ON public.reward_points 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reward points" 
  ON public.reward_points 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));
