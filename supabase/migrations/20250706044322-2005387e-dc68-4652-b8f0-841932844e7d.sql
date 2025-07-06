-- IMPORTANT: This user needs to be deleted from auth.users manually
-- User ID: 95b68564-1009-497d-ad74-1a54ae3e8cee (ayushiaggarwal030@gmail.com)
-- 
-- This user exists in auth.users but their profile was deleted from public.profiles
-- causing 406 errors when they try to login and the app checks admin status.
--
-- To fix this completely:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find user with ID: 95b68564-1009-497d-ad74-1a54ae3e8cee
-- 3. Delete the user manually from the auth.users table
--
-- Alternatively, use the delete-user-account edge function from the admin dashboard

-- Clean up any remaining references (already done in previous migrations but ensuring completeness)
DELETE FROM public.user_roles WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.notifications WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.testimonials WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.reward_points WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.gd_registrations WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.user_referrals WHERE referrer_id = '95b68564-1009-497d-ad74-1a54ae3e8cee' OR referred_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.account_deletion_requests WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.admin_logs WHERE admin_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.media_content WHERE created_by = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.featured_videos WHERE created_by = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.community_announcements WHERE created_by = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.blogs WHERE author_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';