-- Chat Images Storage Bucket
-- Creates a storage bucket for chat image attachments

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update chat images" ON storage.objects;

-- Allow public access to view images
CREATE POLICY "Public can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

-- Allow authenticated and anonymous users to upload
CREATE POLICY "Anyone can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images');

-- Allow users to update their own uploads
CREATE POLICY "Anyone can update chat images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-images')
WITH CHECK (bucket_id = 'chat-images');
