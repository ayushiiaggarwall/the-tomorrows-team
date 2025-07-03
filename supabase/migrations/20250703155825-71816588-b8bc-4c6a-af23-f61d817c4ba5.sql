-- Create function to get count of verified users
CREATE OR REPLACE FUNCTION public.get_verified_users_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE au.email_confirmed_at IS NOT NULL;
$$;

-- Create function to get paginated verified users
CREATE OR REPLACE FUNCTION public.get_verified_users_paginated(start_index integer, end_index integer)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamp with time zone,
  profile_picture_url text,
  date_of_birth date,
  tags text[],
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.id, p.email, p.full_name, p.is_admin, p.created_at, 
         p.profile_picture_url, p.date_of_birth, p.tags, p.updated_at
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE au.email_confirmed_at IS NOT NULL
  ORDER BY p.created_at DESC
  OFFSET start_index
  LIMIT (end_index - start_index + 1);
$$;