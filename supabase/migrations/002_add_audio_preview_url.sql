-- Add audio_preview_url column to prompts table
ALTER TABLE IF EXISTS public.prompts
ADD COLUMN IF NOT EXISTS audio_preview_url TEXT;


