
-- Update the register_for_gd_atomic function to handle cancelled registrations
CREATE OR REPLACE FUNCTION public.register_for_gd_atomic(p_gd_id uuid, p_user_id uuid, p_participant_name text, p_participant_email text, p_participant_phone text, p_participant_occupation text DEFAULT NULL::text, p_participant_occupation_other text DEFAULT NULL::text, p_student_institution text DEFAULT NULL::text, p_student_year text DEFAULT NULL::text, p_professional_company text DEFAULT NULL::text, p_professional_role text DEFAULT NULL::text, p_self_employed_profession text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_slot_capacity INTEGER;
  v_current_registrations INTEGER;
  v_spots_left INTEGER;
  v_existing_registration UUID;
  v_registration_id UUID;
BEGIN
  -- Lock the GD row to prevent concurrent modifications
  SELECT slot_capacity 
  INTO v_slot_capacity
  FROM public.group_discussions 
  WHERE id = p_gd_id AND is_active = true
  FOR UPDATE;
  
  -- Check if GD exists and is active
  IF v_slot_capacity IS NULL THEN
    RAISE EXCEPTION 'GD_NOT_FOUND: Group discussion not found or inactive';
  END IF;
  
  -- Check if user has an active (non-cancelled) registration
  SELECT id INTO v_existing_registration
  FROM public.gd_registrations
  WHERE gd_id = p_gd_id AND user_id = p_user_id AND cancelled_at IS NULL;
  
  IF v_existing_registration IS NOT NULL THEN
    RAISE EXCEPTION 'ALREADY_REGISTERED: User is already registered for this GD';
  END IF;
  
  -- Count current active registrations (excluding cancelled ones)
  SELECT COUNT(*)
  INTO v_current_registrations
  FROM public.gd_registrations
  WHERE gd_id = p_gd_id AND cancelled_at IS NULL;
  
  -- Calculate spots left
  v_spots_left := v_slot_capacity - v_current_registrations;
  
  -- Check if there are spots available
  IF v_spots_left <= 0 THEN
    RAISE EXCEPTION 'GD_FULL: Group discussion is full';
  END IF;
  
  -- Insert the registration
  INSERT INTO public.gd_registrations (
    gd_id,
    user_id,
    participant_name,
    participant_email,
    participant_phone,
    participant_occupation,
    participant_occupation_other,
    student_institution,
    student_year,
    professional_company,
    professional_role,
    self_employed_profession
  ) VALUES (
    p_gd_id,
    p_user_id,
    p_participant_name,
    p_participant_email,
    p_participant_phone,
    p_participant_occupation,
    p_participant_occupation_other,
    p_student_institution,
    p_student_year,
    p_professional_company,
    p_professional_role,
    p_self_employed_profession
  )
  RETURNING id INTO v_registration_id;
  
  -- Return success result with updated spots left
  RETURN json_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'spots_left', v_spots_left - 1,
    'total_capacity', v_slot_capacity,
    'message', 'Registration successful'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception with the original message
    RAISE;
END;
$function$;
