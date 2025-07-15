-- Add session_type column to group_discussions table
ALTER TABLE public.group_discussions 
ADD COLUMN session_type TEXT DEFAULT 'Group Discussion';

-- Update existing records to have the default session type
UPDATE public.group_discussions 
SET session_type = 'Group Discussion' 
WHERE session_type IS NULL;