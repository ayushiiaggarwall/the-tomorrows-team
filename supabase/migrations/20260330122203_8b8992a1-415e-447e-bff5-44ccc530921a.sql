-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============ TABLES ============

CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    full_name text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    date_of_birth date,
    profile_picture_url text,
    tags text[] DEFAULT '{}'::text[]
);

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

CREATE TABLE public.admin_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    points_per_attendance integer DEFAULT 10 NOT NULL,
    points_per_best_speaker integer DEFAULT 20 NOT NULL,
    points_per_referral integer DEFAULT 10 NOT NULL,
    points_per_moderation integer DEFAULT 15 NOT NULL,
    points_per_perfect_attendance integer DEFAULT 50 NOT NULL,
    site_announcement text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.group_discussions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    topic_name text NOT NULL,
    description text,
    scheduled_date timestamp with time zone NOT NULL,
    meet_link text,
    slot_capacity integer DEFAULT 20,
    moderator_id uuid,
    created_by uuid NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_type text DEFAULT 'Group Discussion'::text,
    CONSTRAINT valid_slot_capacity CHECK (((slot_capacity > 0) AND (slot_capacity <= 100)))
);

CREATE TABLE public.gd_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    gd_id uuid NOT NULL,
    user_id uuid NOT NULL,
    registered_at timestamp with time zone DEFAULT now(),
    attended boolean DEFAULT false,
    participant_occupation text,
    participant_occupation_other text,
    participant_email text,
    participant_name text,
    participant_phone text,
    student_institution text,
    student_year text,
    professional_company text,
    professional_role text,
    self_employed_profession text,
    noc_accepted boolean DEFAULT false,
    noc_accepted_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_type text,
    cancellation_reason text,
    CONSTRAINT gd_registrations_cancellation_type_check CHECK ((cancellation_type = ANY (ARRAY['deregister'::text, 'dropout'::text])))
);

CREATE TABLE public.reward_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    reason text NOT NULL,
    type text NOT NULL,
    gd_date date,
    awarded_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reward_points_type_check CHECK ((type = ANY (ARRAY['attendance'::text, 'participation'::text, 'bonus'::text, 'penalty'::text, 'Attendance'::text, 'Star Speaker'::text, 'Best Speaker'::text, 'Critical Thinker'::text, 'Referral'::text, 'No Show'::text, 'Moderator'::text, 'Perf Attendance'::text, 'Quality Content'::text, 'Team Builder'::text, 'Penalty'::text, 'Other'::text]))),
    CONSTRAINT valid_points_range CHECK (((points >= -100) AND (points <= 100)))
);

CREATE TABLE public.blogs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    featured_image_url text,
    tags text[],
    author_id uuid NOT NULL,
    status text DEFAULT 'draft'::text,
    scheduled_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT blogs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'scheduled'::text]))),
    CONSTRAINT valid_content_length CHECK ((char_length(content) <= 50000)),
    CONSTRAINT valid_title_length CHECK ((char_length(title) <= 200))
);

CREATE TABLE public.media_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    media_url text NOT NULL,
    media_type text NOT NULL,
    tags text[],
    is_published boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_featured boolean DEFAULT false,
    video_duration text,
    participant_count integer,
    thumbnail_url text,
    CONSTRAINT media_content_media_type_check CHECK ((media_type = ANY (ARRAY['podcast'::text, 'video'::text, 'past_gd'::text])))
);

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_global boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb
);

CREATE TABLE public.admin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    admin_id uuid NOT NULL,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    user_role text,
    content text NOT NULL,
    rating integer NOT NULL,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT testimonials_valid_content_length CHECK ((char_length(content) <= 2000)),
    CONSTRAINT unique_user_testimonial UNIQUE (user_id)
);

CREATE TABLE public.featured_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    is_featured boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.community_announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.downloadable_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    file_path text NOT NULL,
    file_size bigint,
    file_type text,
    is_active boolean DEFAULT true,
    download_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.predefined_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.site_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    event_type text NOT NULL,
    page_path text,
    user_id uuid,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL UNIQUE,
    referral_code text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT user_referrals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text])))
);

CREATE TABLE public.account_deletion_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT account_deletion_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text])))
);

CREATE TABLE public.gd_chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    gd_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    parent_message_id uuid,
    is_pinned boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    deleted_by uuid,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    message_type character varying(20) DEFAULT 'text'::character varying,
    attachment_url text,
    attachment_filename text,
    poll_id uuid,
    metadata jsonb,
    CONSTRAINT gd_chat_messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['text'::character varying, 'image'::character varying, 'gif'::character varying])::text[])))
);

CREATE TABLE public.gd_message_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gd_message_votes_vote_type_check CHECK ((vote_type = ANY (ARRAY['upvote'::text, 'downvote'::text]))),
    UNIQUE (message_id, user_id)
);

CREATE TABLE public.gd_polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    gd_id uuid NOT NULL,
    message_id uuid,
    poll_type text DEFAULT 'best_speaker'::text NOT NULL,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.gd_poll_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    poll_id uuid NOT NULL,
    user_id uuid NOT NULL,
    option_text text NOT NULL,
    vote_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.gd_poll_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    poll_id uuid NOT NULL,
    option_id uuid NOT NULL,
    voter_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (poll_id, voter_id)
);

-- ============ FOREIGN KEYS ============

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.group_discussions ADD CONSTRAINT group_discussions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.group_discussions ADD CONSTRAINT group_discussions_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES auth.users(id);
ALTER TABLE public.gd_registrations ADD CONSTRAINT gd_registrations_gd_id_fkey FOREIGN KEY (gd_id) REFERENCES public.group_discussions(id) ON DELETE CASCADE;
ALTER TABLE public.gd_registrations ADD CONSTRAINT gd_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reward_points ADD CONSTRAINT reward_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reward_points ADD CONSTRAINT reward_points_awarded_by_fkey FOREIGN KEY (awarded_by) REFERENCES auth.users(id);
ALTER TABLE public.blogs ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);
ALTER TABLE public.media_content ADD CONSTRAINT media_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);
ALTER TABLE public.community_announcements ADD CONSTRAINT community_announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.account_deletion_requests ADD CONSTRAINT account_deletion_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_referrals ADD CONSTRAINT user_referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_referrals ADD CONSTRAINT user_referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.gd_chat_messages ADD CONSTRAINT gd_chat_messages_gd_id_fkey FOREIGN KEY (gd_id) REFERENCES public.group_discussions(id) ON DELETE CASCADE;
ALTER TABLE public.gd_chat_messages ADD CONSTRAINT gd_chat_messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE;
ALTER TABLE public.gd_chat_messages ADD CONSTRAINT gd_chat_messages_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.gd_polls(id) ON DELETE CASCADE;
ALTER TABLE public.gd_message_votes ADD CONSTRAINT gd_message_votes_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE;
ALTER TABLE public.gd_poll_options ADD CONSTRAINT gd_poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.gd_polls(id) ON DELETE CASCADE;
ALTER TABLE public.gd_poll_votes ADD CONSTRAINT gd_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.gd_polls(id) ON DELETE CASCADE;
ALTER TABLE public.gd_poll_votes ADD CONSTRAINT gd_poll_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.gd_poll_options(id) ON DELETE CASCADE;
ALTER TABLE public.gd_polls ADD CONSTRAINT gd_polls_gd_id_fkey FOREIGN KEY (gd_id) REFERENCES public.group_discussions(id) ON DELETE CASCADE;
ALTER TABLE public.gd_polls ADD CONSTRAINT gd_polls_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE;

-- ============ FUNCTIONS ============

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = _user_id), FALSE) $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_total_points(_user_id uuid) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT COALESCE(SUM(points), 0) FROM public.reward_points WHERE user_id = _user_id $$;

CREATE OR REPLACE FUNCTION public.get_verified_users_count() RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$ SELECT COUNT(*)::integer FROM public.profiles p JOIN auth.users au ON p.id = au.id WHERE au.email_confirmed_at IS NOT NULL; $$;

CREATE OR REPLACE FUNCTION public.get_verified_users_paginated(start_index integer, end_index integer) RETURNS TABLE(id uuid, email text, full_name text, is_admin boolean, created_at timestamp with time zone, profile_picture_url text, date_of_birth date, tags text[], updated_at timestamp with time zone) LANGUAGE sql SECURITY DEFINER AS $$ SELECT p.id, p.email, p.full_name, p.is_admin, p.created_at, p.profile_picture_url, p.date_of_birth, p.tags, p.updated_at FROM public.profiles p JOIN auth.users au ON p.id = au.id WHERE au.email_confirmed_at IS NOT NULL ORDER BY p.created_at DESC OFFSET start_index LIMIT (end_index - start_index + 1); $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$ BEGIN INSERT INTO public.profiles (id, email, full_name, is_admin) VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name', FALSE); INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'info'::text, p_is_global boolean DEFAULT false, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_notification_id UUID; BEGIN INSERT INTO public.notifications (user_id, title, message, type, is_global, expires_at, metadata) VALUES (p_user_id, p_title, p_message, p_type, p_is_global, p_expires_at, p_metadata) RETURNING id INTO v_notification_id; RETURN v_notification_id; END; $$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN UPDATE public.notifications SET is_read = true, updated_at = now() WHERE id = p_notification_id AND user_id = auth.uid(); RETURN FOUND; END; $$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_count INTEGER; BEGIN UPDATE public.notifications SET is_read = true, updated_at = now() WHERE (user_id = p_user_id OR is_global = true) AND user_id = auth.uid() AND is_read = false; GET DIAGNOSTICS v_count = ROW_COUNT; RETURN v_count; END; $$;

CREATE OR REPLACE FUNCTION public.track_page_view(p_page_path text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_analytics_id UUID; BEGIN INSERT INTO public.site_analytics (event_type, page_path, user_id, ip_address, user_agent) VALUES ('page_view', p_page_path, p_user_id, p_ip_address, p_user_agent) RETURNING id INTO v_analytics_id; RETURN v_analytics_id; END; $$;

CREATE OR REPLACE FUNCTION public.get_analytics_summary() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_total_visits INTEGER; v_today_visits INTEGER; v_total_signups INTEGER; v_today_signups INTEGER; v_unique_visitors INTEGER; BEGIN SELECT COUNT(*) INTO v_total_visits FROM public.site_analytics WHERE event_type = 'page_view'; SELECT COUNT(*) INTO v_today_visits FROM public.site_analytics WHERE event_type = 'page_view' AND created_at >= CURRENT_DATE; SELECT COUNT(*) INTO v_total_signups FROM public.profiles; SELECT COUNT(*) INTO v_today_signups FROM public.profiles WHERE created_at >= CURRENT_DATE; SELECT COUNT(DISTINCT ip_address) INTO v_unique_visitors FROM public.site_analytics WHERE event_type = 'page_view' AND ip_address IS NOT NULL; RETURN json_build_object('total_visits', v_total_visits, 'today_visits', v_today_visits, 'total_signups', v_total_signups, 'today_signups', v_today_signups, 'unique_visitors', v_unique_visitors); END; $$;

CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN UPDATE public.downloadable_resources SET download_count = download_count + 1 WHERE id = resource_id; END; $$;

CREATE OR REPLACE FUNCTION public.register_for_gd_atomic(p_gd_id uuid, p_user_id uuid, p_participant_name text, p_participant_email text, p_participant_phone text, p_participant_occupation text DEFAULT NULL::text, p_participant_occupation_other text DEFAULT NULL::text, p_student_institution text DEFAULT NULL::text, p_student_year text DEFAULT NULL::text, p_professional_company text DEFAULT NULL::text, p_professional_role text DEFAULT NULL::text, p_self_employed_profession text DEFAULT NULL::text) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_slot_capacity INTEGER; v_current_registrations INTEGER; v_spots_left INTEGER; v_existing_registration UUID; v_registration_id UUID; BEGIN SELECT slot_capacity INTO v_slot_capacity FROM public.group_discussions WHERE id = p_gd_id AND is_active = true FOR UPDATE; IF v_slot_capacity IS NULL THEN RAISE EXCEPTION 'GD_NOT_FOUND: Group discussion not found or inactive'; END IF; SELECT id INTO v_existing_registration FROM public.gd_registrations WHERE gd_id = p_gd_id AND user_id = p_user_id AND cancelled_at IS NULL; IF v_existing_registration IS NOT NULL THEN RAISE EXCEPTION 'ALREADY_REGISTERED: User is already registered for this GD'; END IF; SELECT COUNT(*) INTO v_current_registrations FROM public.gd_registrations WHERE gd_id = p_gd_id AND cancelled_at IS NULL; v_spots_left := v_slot_capacity - v_current_registrations; IF v_spots_left <= 0 THEN RAISE EXCEPTION 'GD_FULL: Group discussion is full'; END IF; INSERT INTO public.gd_registrations (gd_id, user_id, participant_name, participant_email, participant_phone, participant_occupation, participant_occupation_other, student_institution, student_year, professional_company, professional_role, self_employed_profession) VALUES (p_gd_id, p_user_id, p_participant_name, p_participant_email, p_participant_phone, p_participant_occupation, p_participant_occupation_other, p_student_institution, p_student_year, p_professional_company, p_professional_role, p_self_employed_profession) RETURNING id INTO v_registration_id; RETURN json_build_object('success', true, 'registration_id', v_registration_id, 'spots_left', v_spots_left - 1, 'total_capacity', v_slot_capacity, 'message', 'Registration successful'); EXCEPTION WHEN OTHERS THEN RAISE; END; $$;

CREATE OR REPLACE FUNCTION public.cancel_gd_registration(p_gd_id uuid, p_user_id uuid) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_gd_scheduled_date TIMESTAMP WITH TIME ZONE; v_hours_until_gd NUMERIC; v_is_dropout BOOLEAN DEFAULT FALSE; v_cancellation_type TEXT; v_cancellation_reason TEXT; v_points_deducted INTEGER DEFAULT 0; BEGIN SELECT gd.scheduled_date INTO v_gd_scheduled_date FROM public.gd_registrations gr JOIN public.group_discussions gd ON gr.gd_id = gd.id WHERE gr.gd_id = p_gd_id AND gr.user_id = p_user_id AND gr.cancelled_at IS NULL; IF v_gd_scheduled_date IS NULL THEN RAISE EXCEPTION 'REGISTRATION_NOT_FOUND: No active registration found for this GD'; END IF; v_hours_until_gd := EXTRACT(EPOCH FROM (v_gd_scheduled_date - NOW())) / 3600; IF v_hours_until_gd < 24 THEN v_is_dropout := TRUE; v_cancellation_type := 'dropout'; v_cancellation_reason := 'Late GD Drop Out - within 24 hours'; v_points_deducted := 10; ELSE v_cancellation_type := 'deregister'; v_cancellation_reason := 'De-registered from GD'; END IF; UPDATE public.gd_registrations SET cancelled_at = NOW(), cancellation_type = v_cancellation_type, cancellation_reason = v_cancellation_reason WHERE gd_id = p_gd_id AND user_id = p_user_id; IF v_is_dropout THEN INSERT INTO public.reward_points (user_id, points, reason, type, gd_date, created_at) VALUES (p_user_id, -10, 'Late GD Drop Out - within 24 hours of scheduled time', 'penalty', v_gd_scheduled_date::DATE, NOW()); END IF; RETURN json_build_object('success', true, 'cancellation_type', v_cancellation_type, 'hours_until_gd', v_hours_until_gd, 'points_deducted', v_points_deducted, 'message', CASE WHEN v_is_dropout THEN 'You dropped out within 24 hours. 10 points have been deducted.' ELSE 'You have successfully de-registered from this GD.' END); EXCEPTION WHEN OTHERS THEN RAISE; END; $$;

CREATE OR REPLACE FUNCTION public.create_best_speaker_poll(p_gd_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_poll_id UUID; v_message_id UUID; v_attendee RECORD; v_gd_date TIMESTAMP WITH TIME ZONE; BEGIN SELECT scheduled_date INTO v_gd_date FROM public.group_discussions WHERE id = p_gd_id; INSERT INTO public.gd_chat_messages (gd_id, user_id, message, message_type, is_pinned) VALUES (p_gd_id, (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1), '🗳️ Voting is now open for the Best Speaker of this session! Please cast your vote below.', 'text', true) RETURNING id INTO v_message_id; INSERT INTO public.gd_polls (gd_id, message_id, poll_type, expires_at) VALUES (p_gd_id, v_message_id, 'best_speaker', v_gd_date + INTERVAL '24 hours') RETURNING id INTO v_poll_id; UPDATE public.gd_chat_messages SET poll_id = v_poll_id WHERE id = v_message_id; FOR v_attendee IN SELECT DISTINCT gr.user_id, p.full_name FROM public.gd_registrations gr JOIN public.profiles p ON gr.user_id = p.id WHERE gr.gd_id = p_gd_id AND gr.attended = true AND gr.cancelled_at IS NULL LOOP INSERT INTO public.gd_poll_options (poll_id, user_id, option_text) VALUES (v_poll_id, v_attendee.user_id, COALESCE(v_attendee.full_name, 'Anonymous User')); END LOOP; RETURN v_poll_id; END; $$;

CREATE OR REPLACE FUNCTION public.vote_in_poll(p_poll_id uuid, p_option_id uuid, p_voter_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_old_option_id UUID; BEGIN SELECT option_id INTO v_old_option_id FROM public.gd_poll_votes WHERE poll_id = p_poll_id AND voter_id = p_voter_id; IF v_old_option_id IS NOT NULL THEN UPDATE public.gd_poll_options SET vote_count = vote_count - 1 WHERE id = v_old_option_id; UPDATE public.gd_poll_votes SET option_id = p_option_id WHERE poll_id = p_poll_id AND voter_id = p_voter_id; ELSE INSERT INTO public.gd_poll_votes (poll_id, option_id, voter_id) VALUES (p_poll_id, p_option_id, p_voter_id); END IF; UPDATE public.gd_poll_options SET vote_count = vote_count + 1 WHERE id = p_option_id; RETURN TRUE; END; $$;

CREATE OR REPLACE FUNCTION public.handle_referral_completion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_referral_record RECORD; v_is_first_attendance BOOLEAN; BEGIN IF LOWER(NEW.type) != 'attendance' THEN RETURN NEW; END IF; SELECT COUNT(*) = 1 INTO v_is_first_attendance FROM public.reward_points WHERE user_id = NEW.user_id AND LOWER(type) = 'attendance'; IF NOT v_is_first_attendance THEN RETURN NEW; END IF; SELECT * INTO v_referral_record FROM public.user_referrals WHERE referred_id = NEW.user_id AND status = 'pending' LIMIT 1; IF v_referral_record.id IS NOT NULL THEN UPDATE public.user_referrals SET status = 'completed', completed_at = NOW() WHERE id = v_referral_record.id; INSERT INTO public.reward_points (user_id, points, reason, type, created_at) VALUES (v_referral_record.referrer_id, 10, 'Friend Referral Completed', 'Referral', NOW()); INSERT INTO public.notifications (user_id, title, message, type, metadata, created_at) VALUES (v_referral_record.referrer_id, '🎉 Referral Bonus Earned!', 'Your referred friend attended their first GD! You''ve earned +10 bonus points.', 'reward', jsonb_build_object('points', 10, 'reason', 'Friend Referral Completed', 'referred_user_id', NEW.user_id), NOW()); END IF; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_referral_signup_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_referral_record RECORD; BEGIN SELECT * INTO v_referral_record FROM public.user_referrals WHERE referred_id = NEW.id LIMIT 1; IF v_referral_record.id IS NOT NULL THEN INSERT INTO public.notifications (user_id, title, message, type, metadata, created_at) VALUES (v_referral_record.referrer_id, '👥 Friend Joined!', COALESCE(NEW.full_name, 'Someone') || ' just signed up using your referral code! They''ll need to attend their first GD for you to earn bonus points.', 'info', jsonb_build_object('referred_user_id', NEW.id, 'referred_user_name', NEW.full_name, 'referral_code', v_referral_record.referral_code), NOW()); END IF; RETURN NEW; END; $$;

-- ============ TRIGGERS ============

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER trigger_handle_referral_completion AFTER INSERT ON public.reward_points FOR EACH ROW EXECUTE FUNCTION public.handle_referral_completion();
CREATE TRIGGER trigger_handle_referral_signup_notification AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_referral_signup_notification();

-- ============ ENABLE RLS ============

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloadable_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predefined_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_message_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_polls ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can manage user roles" ON public.user_roles TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Everyone can view admin settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update admin settings" ON public.admin_settings FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active GDs" ON public.group_discussions FOR SELECT USING ((is_active = true));
CREATE POLICY "Admins can manage all GDs" ON public.group_discussions USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage all group discussions" ON public.group_discussions TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Moderators can view assigned discussions" ON public.group_discussions FOR SELECT TO authenticated USING (((auth.uid() = moderator_id) OR (auth.uid() = created_by)));

CREATE POLICY "All users can view registration counts" ON public.gd_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own registrations" ON public.gd_registrations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own registrations" ON public.gd_registrations FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Admins can manage all registrations" ON public.gd_registrations TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view reward points for leaderboard" ON public.reward_points FOR SELECT USING (true);
CREATE POLICY "Admins can manage all points" ON public.reward_points USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can create reward points" ON public.reward_points FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can delete reward points" ON public.reward_points FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view published blogs" ON public.blogs FOR SELECT USING ((status = 'published'::text));
CREATE POLICY "Admins can manage all blogs" ON public.blogs TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Authors can manage their own blogs" ON public.blogs TO authenticated USING ((auth.uid() = author_id)) WITH CHECK ((auth.uid() = author_id));
CREATE POLICY "Authors can view their own blogs" ON public.blogs FOR SELECT TO authenticated USING ((auth.uid() = author_id));

CREATE POLICY "Anyone can view published media" ON public.media_content FOR SELECT USING ((is_published = true));
CREATE POLICY "Admins can manage all media" ON public.media_content TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Creators can manage their own media" ON public.media_content TO authenticated USING ((auth.uid() = created_by)) WITH CHECK ((auth.uid() = created_by));
CREATE POLICY "Creators can view their own media" ON public.media_content FOR SELECT TO authenticated USING ((auth.uid() = created_by));

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (((auth.uid() = user_id) OR ((is_global = true) AND ((expires_at IS NULL) OR (expires_at > now())))));
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Admins can view all logs" ON public.admin_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can create admin logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING ((is_approved = true));
CREATE POLICY "Users can view their own testimonials" ON public.testimonials FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can create testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own testimonials" ON public.testimonials FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Admins can manage all testimonials" ON public.testimonials USING ((EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

CREATE POLICY "Anyone can view featured videos" ON public.featured_videos FOR SELECT USING ((is_featured = true));
CREATE POLICY "Admins can manage all videos" ON public.featured_videos TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active announcements" ON public.community_announcements FOR SELECT USING ((is_active = true));
CREATE POLICY "Admins can manage announcements" ON public.community_announcements USING ((EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

CREATE POLICY "Anyone can view active resources" ON public.downloadable_resources FOR SELECT USING ((is_active = true));
CREATE POLICY "Admins can manage resources" ON public.downloadable_resources USING ((auth.uid() IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.is_admin = true))));

CREATE POLICY "Anyone can view predefined tags" ON public.predefined_tags FOR SELECT USING (true);
CREATE POLICY "Only admins can manage predefined tags" ON public.predefined_tags TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert analytics" ON public.site_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all analytics" ON public.site_analytics FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own referrals" ON public.user_referrals FOR SELECT USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)));
CREATE POLICY "Users can create referrals for themselves" ON public.user_referrals FOR INSERT WITH CHECK ((auth.uid() = referred_id));
CREATE POLICY "Users can update their own referrals" ON public.user_referrals FOR UPDATE USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)));

CREATE POLICY "Users can view their own deletion requests" ON public.account_deletion_requests FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can create their own deletion requests" ON public.account_deletion_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Admins can manage all deletion requests" ON public.account_deletion_requests USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Registered users can view messages for their GDs" ON public.gd_chat_messages FOR SELECT USING (((EXISTS ( SELECT 1 FROM public.gd_registrations WHERE ((gd_registrations.gd_id = gd_chat_messages.gd_id) AND (gd_registrations.user_id = auth.uid()) AND (gd_registrations.cancelled_at IS NULL)))) OR public.is_admin(auth.uid())));
CREATE POLICY "Registered users can send messages to their GDs" ON public.gd_chat_messages FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1 FROM public.gd_registrations WHERE ((gd_registrations.gd_id = gd_chat_messages.gd_id) AND (gd_registrations.user_id = auth.uid()) AND (gd_registrations.cancelled_at IS NULL))))));
CREATE POLICY "Users can update their own messages" ON public.gd_chat_messages FOR UPDATE USING (((auth.uid() = user_id) OR public.is_admin(auth.uid())));

CREATE POLICY "Users can view votes for messages they can see" ON public.gd_message_votes FOR SELECT USING (((EXISTS ( SELECT 1 FROM (public.gd_chat_messages gcm JOIN public.gd_registrations gr ON ((gcm.gd_id = gr.gd_id))) WHERE ((gcm.id = gd_message_votes.message_id) AND (gr.user_id = auth.uid()) AND (gr.cancelled_at IS NULL)))) OR public.is_admin(auth.uid())));
CREATE POLICY "Users can vote on messages in their GDs" ON public.gd_message_votes FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1 FROM (public.gd_chat_messages gcm JOIN public.gd_registrations gr ON ((gcm.gd_id = gr.gd_id))) WHERE ((gcm.id = gd_message_votes.message_id) AND (gr.user_id = auth.uid()) AND (gr.cancelled_at IS NULL))))));
CREATE POLICY "Users can update their own votes" ON public.gd_message_votes FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own votes" ON public.gd_message_votes FOR DELETE USING ((auth.uid() = user_id));

CREATE POLICY "Users can view polls for their GDs" ON public.gd_polls FOR SELECT USING (((EXISTS ( SELECT 1 FROM public.gd_registrations WHERE ((gd_registrations.gd_id = gd_polls.gd_id) AND (gd_registrations.user_id = auth.uid()) AND (gd_registrations.cancelled_at IS NULL)))) OR public.is_admin(auth.uid())));
CREATE POLICY "Admins can manage polls" ON public.gd_polls USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view poll options for their GDs" ON public.gd_poll_options FOR SELECT USING (((EXISTS ( SELECT 1 FROM (public.gd_polls gp JOIN public.gd_registrations gr ON ((gp.gd_id = gr.gd_id))) WHERE ((gp.id = gd_poll_options.poll_id) AND (gr.user_id = auth.uid()) AND (gr.cancelled_at IS NULL)))) OR public.is_admin(auth.uid())));
CREATE POLICY "Admins can manage poll options" ON public.gd_poll_options USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view poll votes for their GDs" ON public.gd_poll_votes FOR SELECT USING (((EXISTS ( SELECT 1 FROM (public.gd_polls gp JOIN public.gd_registrations gr ON ((gp.gd_id = gr.gd_id))) WHERE ((gp.id = gd_poll_votes.poll_id) AND (gr.user_id = auth.uid()) AND (gr.cancelled_at IS NULL)))) OR public.is_admin(auth.uid())));
CREATE POLICY "Users can vote in polls for their GDs" ON public.gd_poll_votes FOR INSERT WITH CHECK (((auth.uid() = voter_id) AND (EXISTS ( SELECT 1 FROM (public.gd_polls gp JOIN public.gd_registrations gr ON ((gp.gd_id = gr.gd_id))) WHERE ((gp.id = gd_poll_votes.poll_id) AND (gr.user_id = auth.uid()) AND (gr.cancelled_at IS NULL) AND (gp.is_active = true) AND (gp.expires_at > now()))))));
CREATE POLICY "Users can update their own votes" ON public.gd_poll_votes FOR UPDATE USING ((auth.uid() = voter_id));
CREATE POLICY "Admins can manage poll votes" ON public.gd_poll_votes USING (public.is_admin(auth.uid()));

-- ============ REALTIME ============

ALTER TABLE public.community_announcements REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_options REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_votes REPLICA IDENTITY FULL;
ALTER TABLE public.gd_polls REPLICA IDENTITY FULL;
ALTER TABLE public.gd_registrations REPLICA IDENTITY FULL;
ALTER TABLE public.group_discussions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.reward_points REPLICA IDENTITY FULL;

-- ============ SEED DATA ============

INSERT INTO public.predefined_tags (name, category) VALUES
  ('Leadership', 'Skills'), ('Communication', 'Skills'), ('Problem Solving', 'Skills'), ('Critical Thinking', 'Skills'),
  ('Team Player', 'Personality'), ('Creative', 'Personality'), ('Analytical', 'Personality'), ('Organized', 'Personality'),
  ('Technology', 'Interests'), ('Business', 'Interests'), ('Healthcare', 'Interests'), ('Education', 'Interests'),
  ('Finance', 'Interests'), ('Marketing', 'Interests'), ('Public Speaking', 'Skills'), ('Negotiation', 'Skills'),
  ('Research', 'Skills'), ('Writing', 'Skills');

-- ============ STORAGE ============

INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Anyone can view resources" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Admins can upload resources" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'resources') AND (auth.uid() IN (SELECT profiles.id FROM public.profiles WHERE profiles.is_admin = true)));
CREATE POLICY "Admins can update resources" ON storage.objects FOR UPDATE USING ((bucket_id = 'resources') AND (auth.uid() IN (SELECT profiles.id FROM public.profiles WHERE profiles.is_admin = true)));
CREATE POLICY "Admins can delete resources" ON storage.objects FOR DELETE USING ((bucket_id = 'resources') AND (auth.uid() IN (SELECT profiles.id FROM public.profiles WHERE profiles.is_admin = true)));