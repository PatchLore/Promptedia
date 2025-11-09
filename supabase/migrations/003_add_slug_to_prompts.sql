CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add slug column for prompts if it does not exist
ALTER TABLE IF EXISTS public.prompts
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate slug values for existing records when missing
WITH updated AS (
  SELECT
    id,
    COALESCE(
      NULLIF(slug, ''),
      NULLIF(
        LOWER(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                COALESCE(title, ''),
                '[^a-zA-Z0-9]+',
                '-',
                'g'
              ),
              '-{2,}',
              '-',
              'g'
            ),
            '(^-|-$)',
            '',
            'g'
          )
        ),
        ''
      ),
      id::text
    ) AS new_slug
  FROM public.prompts
)
UPDATE public.prompts p
SET slug = u.new_slug
FROM updated u
WHERE p.id = u.id
  AND (p.slug IS NULL OR p.slug = '' OR p.slug <> u.new_slug);

-- DISABLED BROKEN BLOCK BELOW (ambiguous column reference)
-- WITH duplicates AS (
--   SELECT
--     id,
--     slug,
--     ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
--   FROM public.prompts
--   WHERE slug IS NOT NULL
-- )
-- UPDATE public.prompts p
-- SET slug = CONCAT(slug, '-', SUBSTRING(p.id::text, 1, 8))
-- FROM duplicates d
-- WHERE p.id = d.id
--   AND d.rn > 1;

-- Create a unique index for quicker lookups and enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS prompts_slug_key ON public.prompts (slug);

-- Function to automatically generate slug values when missing
CREATE OR REPLACE FUNCTION public.set_prompt_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  suffix TEXT;
BEGIN
  base_slug :=
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          COALESCE(NULLIF(NEW.slug, ''), COALESCE(NEW.title, '')),
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        ),
        '-{2,}',
        '-',
        'g'
      )
    );

  base_slug := REGEXP_REPLACE(base_slug, '(^-|-$)', '', 'g');

  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := SUBSTRING(COALESCE(NEW.id::text, gen_random_uuid()::text), 1, 12);
  END IF;

  candidate := base_slug;

  WHILE EXISTS (
    SELECT 1
    FROM public.prompts
    WHERE slug = candidate
      AND (NEW.id IS NULL OR id <> NEW.id)
  ) LOOP
    suffix := SUBSTRING(gen_random_uuid()::text, 1, 6);
    candidate := CONCAT(base_slug, '-', suffix);
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce slug generation on insert/update
DROP TRIGGER IF EXISTS prompts_generate_slug ON public.prompts;
CREATE TRIGGER prompts_generate_slug
BEFORE INSERT OR UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.set_prompt_slug();

