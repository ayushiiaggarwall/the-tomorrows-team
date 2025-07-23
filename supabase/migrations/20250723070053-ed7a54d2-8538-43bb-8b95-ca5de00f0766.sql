-- Add message type and attachments to chat messages
ALTER TABLE public.gd_chat_messages 
ADD COLUMN message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif')),
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_filename TEXT;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);

-- Create storage policies for chat attachments
CREATE POLICY "Users can view chat attachments for their GDs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-attachments' AND
  EXISTS (
    SELECT 1 FROM public.gd_chat_messages gcm
    JOIN public.gd_registrations gr ON gcm.gd_id = gr.gd_id
    WHERE gcm.attachment_url = CONCAT('https://your-project.supabase.co/storage/v1/object/public/chat-attachments/', name)
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
  )
);

CREATE POLICY "Users can upload chat attachments for their GDs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);