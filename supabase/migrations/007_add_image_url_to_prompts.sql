-- Add image_url column to prompts table for Supabase Storage preview images
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_image_url ON prompts(image_url) WHERE image_url IS NOT NULL;

