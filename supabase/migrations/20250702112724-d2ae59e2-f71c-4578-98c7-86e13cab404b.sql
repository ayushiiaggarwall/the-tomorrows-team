-- Update the check constraint to allow all the types used in the admin interface plus new ones
ALTER TABLE public.reward_points 
DROP CONSTRAINT IF EXISTS reward_points_type_check;

ALTER TABLE public.reward_points 
ADD CONSTRAINT reward_points_type_check 
CHECK (type IN ('attendance', 'participation', 'bonus', 'penalty', 'Attendance', 'Best Speaker', 'Moderator', 'Referral', 'Perfect Attendance', 'Perf Attendance', 'Penalty', 'Other'));