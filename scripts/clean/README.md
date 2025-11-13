# Cleanup Scripts

Scripts for cleaning up test data and maintaining database hygiene.

## Remove Test Prompts

### Remove "Test Slug Generation" prompts

```bash
npm run clean:test-prompts
```

This script removes prompts matching "test slug generation" (case-insensitive).

### Remove ALL test-related prompts

```bash
npm run clean:all-test-prompts
```

This script removes all prompts matching:
- "test slug"
- "test-slug"
- "Test Slug"
- "test generation"
- "Test Generation"

## After Running

After deleting test prompts, you should:

1. **Clear Next.js ISR cache** for affected routes:
   
   **Option A: Rebuild (recommended for production)**
   ```bash
   npm run build
   ```
   
   **Option B: Manual revalidation (if using on-demand revalidation)**
   - Visit `/api/revalidate?path=/browse&secret=YOUR_SECRET`
   - Visit `/api/revalidate?path=/prompts/[slug]&secret=YOUR_SECRET`
   - Visit `/api/revalidate?path=/packs&secret=YOUR_SECRET`
   - Visit `/api/revalidate?path=/search&secret=YOUR_SECRET`
   
   **Option C: Clear Vercel cache (if deployed)**
   - Go to Vercel Dashboard → Your Project → Settings → Data Cache
   - Click "Purge Everything" or purge specific paths

2. **Verify removal**:
   ```bash
   npm run clean:verify
   ```
   
   Or manually check:
   - Search results don't include deleted prompts
   - Related prompts sections
   - Random prompt sections
   - Prompt detail pages return 404 for deleted slugs

3. **Check affected routes**:
   - `/browse` - Should not show test prompts
   - `/prompts/[test-slug]` - Should return 404
   - `/search?q=test` - Should not return test prompts
   - `/packs` - Should not reference test prompts

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Make sure `.env.local` contains these variables.

