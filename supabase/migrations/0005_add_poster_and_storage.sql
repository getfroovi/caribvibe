-- Add poster_url to series and videos
ALTER TABLE series ADD COLUMN poster_url TEXT;
ALTER TABLE videos ADD COLUMN poster_url TEXT;

-- Create the public 'images' bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies
-- 1. Allow public read access to the images bucket
CREATE POLICY "Public Read Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- 2. Allow authenticated users to upload to the images bucket
CREATE POLICY "Auth Insert Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 3. Allow authenticated users to update their images
CREATE POLICY "Auth Update Images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users to delete images
CREATE POLICY "Auth Delete Images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
