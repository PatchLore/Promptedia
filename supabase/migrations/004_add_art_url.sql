-- Add art_url column to prompts table for AI-generated artwork
ALTER TABLE IF EXISTS public.prompts
ADD COLUMN IF NOT EXISTS art_url TEXT;

