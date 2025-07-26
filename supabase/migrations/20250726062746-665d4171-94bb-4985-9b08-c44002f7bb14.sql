-- Set replica identity to FULL for better real-time updates
ALTER TABLE public.gd_polls REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_options REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_votes REPLICA IDENTITY FULL;