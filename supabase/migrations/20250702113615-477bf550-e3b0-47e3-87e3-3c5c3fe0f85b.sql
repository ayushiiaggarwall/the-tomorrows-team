-- Fix the referral completion trigger to handle both 'attendance' and 'Attendance' types
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
  v_is_first_attendance BOOLEAN;
BEGIN
  -- Only proceed if this is an attendance reward (handle both lowercase and capitalized)
  IF LOWER(NEW.type) != 'attendance' THEN
    RETURN NEW;
  END IF;
  
  -- Check if this is the user's first attendance points (check both cases)
  SELECT COUNT(*) = 1 INTO v_is_first_attendance
  FROM public.reward_points
  WHERE user_id = NEW.user_id AND LOWER(type) = 'attendance';
  
  -- Only proceed if this is their first attendance
  IF NOT v_is_first_attendance THEN
    RETURN NEW;
  END IF;
  
  -- Find pending referral for this user
  SELECT * INTO v_referral_record
  FROM public.user_referrals
  WHERE referred_id = NEW.user_id 
    AND status = 'pending'
  LIMIT 1;
  
  -- If referral found, complete it
  IF v_referral_record.id IS NOT NULL THEN
    -- Mark referral as completed
    UPDATE public.user_referrals
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = v_referral_record.id;
    
    -- Award points to referrer
    INSERT INTO public.reward_points (
      user_id,
      points,
      reason,
      type,
      created_at
    ) VALUES (
      v_referral_record.referrer_id,
      10,
      'Friend Referral Completed',
      'Referral',
      NOW()
    );
    
    -- Create notification for referrer
    INSERT INTO public.notifications (
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
        'referred_user_id', NEW.user_id
      ),
      NOW()
    );
    
    RAISE LOG 'Referral completed for user % by referrer %', NEW.user_id, v_referral_record.referrer_id;
  END IF;
  
  RETURN NEW;
END;
$$;