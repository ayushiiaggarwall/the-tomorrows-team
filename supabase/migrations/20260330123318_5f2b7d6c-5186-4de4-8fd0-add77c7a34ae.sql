
-- Drop FK constraint on reward_points to allow importing legacy data
ALTER TABLE public.reward_points DROP CONSTRAINT IF EXISTS reward_points_user_id_fkey;
ALTER TABLE public.reward_points DROP CONSTRAINT IF EXISTS reward_points_awarded_by_fkey;
