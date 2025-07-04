-- Clean up orphaned data for user 95b68564-1009-497d-ad74-1a54ae3e8cee
-- This user's profile was deleted but media content still references them

-- Delete the remaining media content records that are causing foreign key constraint violations
DELETE FROM public.media_content 
WHERE created_by = '95b68564-1009-497d-ad74-1a54ae3e8cee';

-- Clean up any other potential orphaned records
DELETE FROM public.notifications 
WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';

DELETE FROM public.testimonials 
WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';

DELETE FROM public.account_deletion_requests 
WHERE user_id = '95b68564-1009-497d-ad74-1a54ae3e8cee';