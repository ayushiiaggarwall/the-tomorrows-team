
-- First, let's check the current referral relationship
SELECT ur.*, p1.email as referrer_email, p2.email as referred_email
FROM user_referrals ur
JOIN profiles p1 ON ur.referrer_id = p1.id
JOIN profiles p2 ON ur.referred_id = p2.id
WHERE p2.email = 'aggarwalayushi0109@gmail.com' OR p1.email = 'umansh798@gmail.com';

-- Check if the user has attendance points
SELECT rp.*, p.email
FROM reward_points rp
JOIN profiles p ON rp.user_id = p.id
WHERE p.email = 'aggarwalayushi0109@gmail.com' AND rp.type = 'attendance';

-- Let's also check if the trigger exists and is working
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_handle_referral_completion';

-- Now let's manually complete the referral if it exists and should be completed
DO $$
DECLARE
  v_referral_record RECORD;
  v_referred_user_id UUID;
  v_attendance_count INTEGER;
BEGIN
  -- Get the referred user ID
  SELECT id INTO v_referred_user_id
  FROM profiles
  WHERE email = 'aggarwalayushi0109@gmail.com';
  
  IF v_referred_user_id IS NULL THEN
    RAISE NOTICE 'User not found: aggarwalayushi0109@gmail.com';
    RETURN;
  END IF;
  
  -- Check attendance points count
  SELECT COUNT(*) INTO v_attendance_count
  FROM reward_points
  WHERE user_id = v_referred_user_id AND type = 'attendance';
  
  RAISE NOTICE 'User % has % attendance points', v_referred_user_id, v_attendance_count;
  
  -- Find pending referral for this user
  SELECT * INTO v_referral_record
  FROM user_referrals
  WHERE referred_id = v_referred_user_id 
    AND status = 'pending'
  LIMIT 1;
  
  -- If referral found and user has attendance points, complete it
  IF v_referral_record.id IS NOT NULL AND v_attendance_count > 0 THEN
    -- Mark referral as completed
    UPDATE user_referrals
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = v_referral_record.id;
    
    -- Award points to referrer
    INSERT INTO reward_points (
      user_id,
      points,
      reason,
      type,
      created_at
    ) VALUES (
      v_referral_record.referrer_id,
      10,
      'Friend Referral Completed',
      'referral',
      NOW()
    );
    
    -- Create notification for referrer
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      metadata,
      created_at
    ) VALUES (
      v_referral_record.referrer_id,
      '🎉 Referral Bonus Earned!',
      'Your referred friend attended their first GD! You''ve earned +10 bonus points.',
      'reward',
      jsonb_build_object(
        'points', 10,
        'reason', 'Friend Referral Completed',
        'referred_user_id', v_referred_user_id
      ),
      NOW()
    );
    
    RAISE NOTICE 'Referral completed for user % by referrer %', v_referred_user_id, v_referral_record.referrer_id;
  ELSE
    RAISE NOTICE 'No pending referral found or no attendance points';
  END IF;
END;
$$;
