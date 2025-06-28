
-- Add columns to track registration cancellation status
ALTER TABLE public.gd_registrations 
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cancellation_type TEXT CHECK (cancellation_type IN ('deregister', 'dropout')),
ADD COLUMN cancellation_reason TEXT;

-- Create an index for better query performance on cancelled registrations
CREATE INDEX idx_gd_registrations_cancelled ON public.gd_registrations(gd_id, cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Create a function to handle GD cancellation with point deduction logic
CREATE OR REPLACE FUNCTION public.cancel_gd_registration(
  p_gd_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration_exists BOOLEAN DEFAULT FALSE;
  v_gd_scheduled_date TIMESTAMP WITH TIME ZONE;
  v_hours_until_gd NUMERIC;
  v_is_dropout BOOLEAN DEFAULT FALSE;
  v_cancellation_type TEXT;
  v_cancellation_reason TEXT;
  v_points_deducted INTEGER DEFAULT 0;
BEGIN
  -- Get the GD scheduled date and check if registration exists
  SELECT gd.scheduled_date
  INTO v_gd_scheduled_date
  FROM public.gd_registrations gr
  JOIN public.group_discussions gd ON gr.gd_id = gd.id
  WHERE gr.gd_id = p_gd_id 
    AND gr.user_id = p_user_id 
    AND gr.cancelled_at IS NULL;
  
  -- Check if registration exists
  IF v_gd_scheduled_date IS NULL THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_FOUND: No active registration found for this GD';
  END IF;
  
  -- Calculate hours until GD
  v_hours_until_gd := EXTRACT(EPOCH FROM (v_gd_scheduled_date - NOW())) / 3600;
  
  -- Determine if it's a dropout (less than 24 hours) or deregister
  IF v_hours_until_gd < 24 THEN
    v_is_dropout := TRUE;
    v_cancellation_type := 'dropout';
    v_cancellation_reason := 'Late GD Drop Out - within 24 hours';
    v_points_deducted := 10;
  ELSE
    v_cancellation_type := 'deregister';
    v_cancellation_reason := 'De-registered from GD';
  END IF;
  
  -- Update the registration record
  UPDATE public.gd_registrations
  SET 
    cancelled_at = NOW(),
    cancellation_type = v_cancellation_type,
    cancellation_reason = v_cancellation_reason
  WHERE gd_id = p_gd_id AND user_id = p_user_id;
  
  -- If it's a dropout, deduct points
  IF v_is_dropout THEN
    INSERT INTO public.reward_points (
      user_id,
      points,
      reason,
      type,
      gd_date,
      created_at
    ) VALUES (
      p_user_id,
      -10,
      'Late GD Drop Out - within 24 hours of scheduled time',
      'penalty',
      v_gd_scheduled_date::DATE,
      NOW()
    );
  END IF;
  
  -- Return success result
  RETURN json_build_object(
    'success', true,
    'cancellation_type', v_cancellation_type,
    'hours_until_gd', v_hours_until_gd,
    'points_deducted', v_points_deducted,
    'message', 
    CASE 
      WHEN v_is_dropout THEN 'You dropped out within 24 hours. 10 points have been deducted.'
      ELSE 'You have successfully de-registered from this GD.'
    END
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
