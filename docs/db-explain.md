# Supabase Performance Notes

```
-- Recommended EXPLAIN ANALYZE commands (run inside Supabase SQL editor)
EXPLAIN ANALYZE
SELECT id, title, slug, created_at
FROM public.prompts
WHERE is_public = true AND is_pro = false
ORDER BY created_at DESC
LIMIT 20;

EXPLAIN ANALYZE
SELECT slug
FROM public.prompts
WHERE slug = 'example-slug'
LIMIT 1;

EXPLAIN ANALYZE
SELECT prompt_id
FROM public.favorites
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

> Note: Indexes on `prompts(created_at)`, `prompts(slug)`, `prompts(category)` and `favorites(user_id)` should keep the above queries responsive under load.
