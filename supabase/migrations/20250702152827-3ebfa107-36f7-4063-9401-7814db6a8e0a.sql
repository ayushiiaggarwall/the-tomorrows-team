-- Fix profiles table RLS policies to ensure users can view complete profile data

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Everyone can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a single, clear policy for profile viewing
CREATE POLICY "Public profile access" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep the existing admin and user update policies as they are
-- (No changes needed for those)