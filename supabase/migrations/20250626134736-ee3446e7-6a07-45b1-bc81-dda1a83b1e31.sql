
-- Create storage bucket for downloadable resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', false);

-- Create policies for the resources bucket
-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view resources" ON storage.objects
FOR SELECT USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- Allow admins to upload files
CREATE POLICY "Admins can upload resources" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resources' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Allow admins to update files
CREATE POLICY "Admins can update resources" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'resources' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete resources" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resources' AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Create table to track downloadable resources
CREATE TABLE public.downloadable_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on downloadable_resources
ALTER TABLE public.downloadable_resources ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active resources
CREATE POLICY "Anyone can view active resources" ON public.downloadable_resources
FOR SELECT USING (is_active = true);

-- Allow admins to manage resources
CREATE POLICY "Admins can manage resources" ON public.downloadable_resources
FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.downloadable_resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$;
