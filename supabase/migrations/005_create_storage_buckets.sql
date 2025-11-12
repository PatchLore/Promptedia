-- Create storage buckets for art and music previews
-- Run this in Supabase SQL Editor before running the upload script

-- Create art-previews bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('art-previews', 'art-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Create music-previews bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-previews', 'music-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public access
-- Art previews bucket policy
CREATE POLICY IF NOT EXISTS "Art previews are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'art-previews');

-- Music previews bucket policy
CREATE POLICY IF NOT EXISTS "Music previews are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-previews');

-- Allow authenticated users to upload (optional, for future use)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload art previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'art-previews' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload music previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music-previews' AND auth.role() = 'authenticated');

