CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Normalize existing slug values (fallback to title or id when necessary)
WITH normalized AS (
  SELECT
    p.id,
    COALESCE(
      NULLIF(
        LOWER(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                COALESCE(NULLIF(p.slug, ''), COALESCE(p.title, '')),
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
      SUBSTRING(p.id::text, 1, 12)
    ) AS desired_slug
  FROM public.prompts p
)
UPDATE public.prompts AS p
SET slug = n.desired_slug
FROM normalized n
WHERE p.id = n.id
  AND p.slug IS DISTINCT FROM n.desired_slug;

-- Resolve any remaining duplicate slugs by appending a short suffix
WITH duplicate_rows AS (
  SELECT
    p.id,
    p.slug,
    ROW_NUMBER() OVER (PARTITION BY p.slug ORDER BY p.created_at, p.id) AS rn
  FROM public.prompts p
  WHERE p.slug IS NOT NULL
)
UPDATE public.prompts AS p
SET slug = CONCAT(p.slug, '-', SUBSTRING(gen_random_uuid()::text, 1, 6))
FROM duplicate_rows d
WHERE p.id = d.id
  AND d.rn > 1;

-- Recreate unique index to enforce slug uniqueness
DROP INDEX IF EXISTS prompts_slug_key;
CREATE UNIQUE INDEX prompts_slug_key ON public.prompts (slug);

