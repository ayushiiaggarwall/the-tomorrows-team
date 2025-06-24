
-- Create storage bucket for media thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-thumbnails', 'media-thumbnails', true);

-- Create policy to allow public access to thumbnails
CREATE POLICY "Public access to media thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'media-thumbnails');

-- Create policy to allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media-thumbnails' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update thumbnails
CREATE POLICY "Authenticated users can update thumbnails" ON storage.objects
FOR UPDATE USING (bucket_id = 'media-thumbnails' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete thumbnails
CREATE POLICY "Authenticated users can delete thumbnails" ON storage.objects
FOR DELETE USING (bucket_id = 'media-thumbnails' AND auth.role() = 'authenticated');

-- Add thumbnail_url column to media_content table if it doesn't exist
ALTER TABLE media_content ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
