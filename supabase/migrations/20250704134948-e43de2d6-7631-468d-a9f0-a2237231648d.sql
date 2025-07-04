-- Check and clean up any remaining auth user data for 95b68564-1009-497d-ad74-1a54ae3e8cee
-- This should completely remove the user from the auth.users table

-- First let's try to delete the user from auth.users table using admin API
-- Note: This needs to be done via the admin API, but we can check if the user exists

-- Check if user exists in auth.users (we can't directly query auth schema but we can clean up any remaining references)

-- Clean up any remaining traces that might cause 406 errors
-- Delete any remaining user_roles
DELETE FROM public.user_roles WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';

-- Make sure all tables are clean
DELETE FROM public.notifications WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.testimonials WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.reward_points WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.gd_registrations WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.user_referrals WHERE referrer_id = '95b68564-1009-497d-ad74-1a54ae3e8cee' OR referred_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.account_deletion_requests WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';
DELETE FROM public.admin_logs WHERE admin_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';