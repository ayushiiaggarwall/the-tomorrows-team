-- Make chat-attachments bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chat-attachments';