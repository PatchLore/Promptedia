-- Fix missing prompt media URLs in Supabase
-- Replace placeholder thumbnails with real Supabase storage image URLs
-- Link existing AI audio previews for music prompts

-- Update thumbnail_url for prompts with placeholder images
UPDATE prompts
SET thumbnail_url = CASE
  WHEN category = 'Art' THEN 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/art/Cyberpunk%20Skyline.jpeg'
  WHEN category = 'Music' THEN 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/art/Ethereal%20Wings.jpeg'
  WHEN category = 'Writing' THEN 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/art/Astral%20Garden.jpeg'
  WHEN category = 'Coding' THEN 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/art/Glass%20Ocean.jpg'
  WHEN category = 'Business' THEN 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/art/Golden%20Hour%20Street.jpeg'
  ELSE thumbnail_url
END
WHERE thumbnail_url LIKE '/images/placeholder.svg' 
   OR thumbnail_url LIKE '%placeholder%'
   OR thumbnail_url IS NULL
   OR thumbnail_url = '';

-- Update audio_preview_url for Music prompts without audio
UPDATE prompts
SET audio_preview_url = 'https://kcuhjqhxlnlzuozqhwoa.supabase.co/storage/v1/object/public/art_images/music_previews/preview_ambient_demo.mp3'
WHERE audio_preview_url IS NULL 
  AND category = 'Music';

