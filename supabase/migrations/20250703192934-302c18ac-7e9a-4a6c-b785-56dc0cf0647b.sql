-- Manually award penalty for the specific no-show case
INSERT INTO public.reward_points (
  user_id,
  points,
  type,
  reason,
  gd_date,
  created_at
) VALUES (
  'cf7b7d7f-a855-4639-9dac-5dc4329902e1',
  -10,
  'No Show',
  'No Show - AI is boon or bane?',
  '2025-07-03',
  NOW()
);

-- Create notification for the user
SELECT create_notification(
  'cf7b7d7f-a855-4639-9dac-5dc4329902e1',
  '⚠️ No Show Penalty',
  'You were marked absent for "AI is boon or bane?" and have been deducted 10 points. Please ensure to attend future GDs or cancel in advance.',
  'warning',
  false,
  NULL,
  jsonb_build_object(
    'gd_id', '4c11c417-0fd5-4e2d-8f0c-dd97aa7951fa',
    'gd_topic', 'AI is boon or bane?',
    'penalty_points', -10,
    'reason', 'No Show'
  )
);