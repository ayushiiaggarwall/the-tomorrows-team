-- Update the check constraint to include all types used in the admin interface
ALTER TABLE public.reward_points 
DROP CONSTRAINT IF EXISTS reward_points_type_check;

ALTER TABLE public.reward_points 
ADD CONSTRAINT reward_points_type_check 
CHECK (type IN (
  'attendance', 'participation', 'bonus', 'penalty', 
  'Attendance', 'Star Speaker', 'Best Speaker', 'Critical Thinker', 
  'Referral', 'No Show', 'Moderator', 'Perf Attendance', 
  'Quality Content', 'Team Builder', 'Penalty', 'Other'
));