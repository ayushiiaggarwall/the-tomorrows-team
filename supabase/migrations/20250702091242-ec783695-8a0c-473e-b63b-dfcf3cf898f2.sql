
-- First, let's check if the triggers exist and recreate them properly
DROP TRIGGER IF EXISTS trigger_handle_referral_completion ON public.reward_points;
DROP TRIGGER IF EXISTS trigger_handle_referral_signup_notification ON public.profiles;

-- Recreate the referral completion trigger function
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
  v_is_first_attendance BOOLEAN;
BEGIN
  -- Only proceed if this is an attendance reward
  IF NEW.type != 'attendance' THEN
    RETURN NEW;
  END IF;
  
  -- Check if this is the user's first attendance points
  SELECT COUNT(*) = 1 INTO v_is_first_attendance
  FROM public.reward_points
  WHERE user_id = NEW.user_id AND type = 'attendance';
  
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
      'referral',
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

-- Recreate the signup notification trigger function
CREATE OR REPLACE FUNCTION public.handle_referral_signup_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
BEGIN
  -- Find referral for this new user
  SELECT * INTO v_referral_record
  FROM public.user_referrals
  WHERE referred_id = NEW.id
  LIMIT 1;
  
  -- If referral found, notify referrer
  IF v_referral_record.id IS NOT NULL THEN
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
      '👥 Friend Joined!',
      COALESCE(NEW.full_name, 'Someone') || ' just signed up using your referral code! They''ll need to attend their first GD for you to earn bonus points.',
      'info',
      jsonb_build_object(
        'referred_user_id', NEW.id,
        'referred_user_name', NEW.full_name,
        'referral_code', v_referral_record.referral_code
      ),
      NOW()
    );
    
    RAISE LOG 'Signup notification sent to referrer % for new user %', v_referral_record.referrer_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the triggers
CREATE TRIGGER trigger_handle_referral_completion
  AFTER INSERT ON public.reward_points
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_completion();

CREATE TRIGGER trigger_handle_referral_signup_notification
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_signup_notification();

-- Manually trigger the signup notification for the existing referral
-- (This will send the missing signup notification)
DO $$
DECLARE
  referrer_user_id UUID;
  referred_user_name TEXT;
  referral_code_val TEXT;
BEGIN
  -- Get the referral details
  SELECT ur.referrer_id, p.full_name, ur.referral_code
  INTO referrer_user_id, referred_user_name, referral_code_val
  FROM public.user_referrals ur
  JOIN public.profiles p ON p.id = ur.referred_id
  WHERE ur.referred_id = (SELECT id FROM public.profiles WHERE email = 'umansh798@gmail.com')
  LIMIT 1;
  
  -- If referral found, send notification
  IF referrer_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      metadata,
      created_at
    ) VALUES (
      referrer_user_id,
      '👥 Friend Joined!',
      COALESCE(referred_user_name, 'Someone') || ' just signed up using your referral code! They''ll need to attend their first GD for you to earn bonus points.',
      'info',
      jsonb_build_object(
        'referred_user_name', referred_user_name,
        'referral_code', referral_code_val
      ),
      NOW()
    );
  END IF;
END;
$$;
