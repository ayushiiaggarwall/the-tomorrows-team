
-- Temporarily drop the FK constraint to allow importing legacy profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now the profiles can be inserted without auth.users entries
