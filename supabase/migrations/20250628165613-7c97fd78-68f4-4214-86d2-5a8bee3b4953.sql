
-- Check the current valid_points_range constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.reward_points'::regclass 
AND conname = 'valid_points_range';

-- Drop the existing constraint that prevents negative points
ALTER TABLE public.reward_points 
DROP CONSTRAINT IF EXISTS valid_points_range;

-- Add a new constraint that allows negative points (for penalties)
ALTER TABLE public.reward_points 
ADD CONSTRAINT valid_points_range 
CHECK (points >= -100 AND points <= 100);
