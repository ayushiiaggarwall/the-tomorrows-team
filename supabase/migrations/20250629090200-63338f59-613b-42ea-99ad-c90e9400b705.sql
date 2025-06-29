
-- Drop the current policy and create one that allows everyone to read admin settings
DROP POLICY IF EXISTS "All authenticated users can view admin settings" ON public.admin_settings;

CREATE POLICY "Everyone can view admin settings" 
  ON public.admin_settings 
  FOR SELECT 
  USING (true);

-- Also ensure non-authenticated users can view profiles and reward points for leaderboard
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can view all reward points" ON public.reward_points;

CREATE POLICY "Everyone can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Everyone can view all reward points" 
  ON public.reward_points 
  FOR SELECT 
  USING (true);
