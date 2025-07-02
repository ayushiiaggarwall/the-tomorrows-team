
-- Remove the unique constraint that prevents re-registration
ALTER TABLE public.gd_registrations DROP CONSTRAINT IF EXISTS gd_registrations_gd_id_user_id_key;

-- Add a unique constraint only for active registrations
CREATE UNIQUE INDEX gd_registrations_active_unique 
ON public.gd_registrations (gd_id, user_id) 
WHERE cancelled_at IS NULL;
