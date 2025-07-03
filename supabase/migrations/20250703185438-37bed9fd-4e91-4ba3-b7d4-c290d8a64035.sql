-- Update the reward_points type check constraint to include Star Speaker and remove Best Speaker
ALTER TABLE public.reward_points DROP CONSTRAINT reward_points_type_check;

ALTER TABLE public.reward_points ADD CONSTRAINT reward_points_type_check 
CHECK (type = ANY (ARRAY[
  'attendance'::text, 
  'participation'::text, 
  'bonus'::text, 
  'penalty'::text, 
  'Attendance'::text, 
  'Star Speaker'::text, 
  'Moderator'::text, 
  'Referral'::text, 
  'Perfect Attendance'::text, 
  'Perf Attendance'::text, 
  'Penalty'::text, 
  'Other'::text,
  'Quality Content'::text,
  'Team Builder'::text
]));