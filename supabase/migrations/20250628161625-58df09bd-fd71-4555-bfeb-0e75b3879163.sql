
-- Check what values are currently allowed in the reward_points type constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.reward_points'::regclass 
AND contype = 'c';

-- Update the check constraint to allow 'penalty' as a valid type
ALTER TABLE public.reward_points 
DROP CONSTRAINT IF EXISTS reward_points_type_check;

ALTER TABLE public.reward_points 
ADD CONSTRAINT reward_points_type_check 
CHECK (type IN ('attendance', 'participation', 'bonus', 'penalty'));
