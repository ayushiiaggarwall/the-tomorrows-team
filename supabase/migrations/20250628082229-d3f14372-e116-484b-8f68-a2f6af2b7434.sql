
-- Add NOC acceptance columns to gd_registrations table
ALTER TABLE public.gd_registrations 
ADD COLUMN noc_accepted boolean DEFAULT false,
ADD COLUMN noc_accepted_at timestamp with time zone DEFAULT NULL;
