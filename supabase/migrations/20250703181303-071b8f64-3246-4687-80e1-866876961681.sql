-- Enable realtime for tables if not already enabled
ALTER TABLE public.gd_registrations REPLICA IDENTITY FULL;
ALTER TABLE public.group_discussions REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_discussions;