-- Add metadata column to gd_chat_messages for storing additional message data
ALTER TABLE public.gd_chat_messages 
ADD COLUMN metadata JSONB;