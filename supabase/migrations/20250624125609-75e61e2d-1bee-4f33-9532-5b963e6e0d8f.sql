
-- Add the missing participant_email column and other required fields
ALTER TABLE public.gd_registrations 
ADD COLUMN IF NOT EXISTS participant_email TEXT,
ADD COLUMN IF NOT EXISTS participant_name TEXT,
ADD COLUMN IF NOT EXISTS participant_phone TEXT;

-- Add specific fields for different occupation types
ALTER TABLE public.gd_registrations 
ADD COLUMN IF NOT EXISTS student_institution TEXT,
ADD COLUMN IF NOT EXISTS student_year TEXT,
ADD COLUMN IF NOT EXISTS professional_company TEXT,
ADD COLUMN IF NOT EXISTS professional_role TEXT,
ADD COLUMN IF NOT EXISTS self_employed_profession TEXT;
