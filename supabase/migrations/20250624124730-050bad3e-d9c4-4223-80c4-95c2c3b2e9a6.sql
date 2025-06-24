
-- Add new columns to gd_registrations table for occupation
ALTER TABLE public.gd_registrations 
ADD COLUMN IF NOT EXISTS participant_occupation TEXT,
ADD COLUMN IF NOT EXISTS participant_occupation_other TEXT;

-- Remove old columns that are no longer needed
ALTER TABLE public.gd_registrations 
DROP COLUMN IF EXISTS college_name,
DROP COLUMN IF EXISTS year_of_study;
