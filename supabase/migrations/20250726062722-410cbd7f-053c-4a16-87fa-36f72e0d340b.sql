-- Enable real-time updates for poll-related tables
ALTER TABLE public.gd_polls REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_options REPLICA IDENTITY FULL;
ALTER TABLE public.gd_poll_votes REPLICA IDENTITY FULL;

-- Add poll tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_poll_votes;