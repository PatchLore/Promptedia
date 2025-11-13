# Remove Test Prompts Guide

## Overview

This guide explains how to remove test prompts like "Test Slug Generation 123" from the OnPointPrompt database and ensure they don't appear anywhere in the application.

## Quick Start

### Remove "Test Slug Generation" prompts

```bash
npm run clean:test-prompts
```

### Remove ALL test-related prompts

```bash
npm run clean:all-test-prompts
```

### Verify removal

```bash
npm run clean:verify
```

## What Gets Removed

### Specific Script (`clean:test-prompts`)
Removes prompts matching:
- "test slug generation" (case-insensitive)

### Comprehensive Script (`clean:all-test-prompts`)
Removes prompts matching:
- "test slug"
- "test-slug"
- "Test Slug"
- "test generation"
- "Test Generation"

## Files Created

1. **`scripts/clean/remove-test-prompts.ts`**
   - Removes "Test Slug Generation" prompts specifically
   - Shows what will be deleted before deletion
   - Provides clear feedback

2. **`scripts/clean/remove-all-test-prompts.ts`**
   - Removes all test-related prompts
   - More comprehensive cleanup
   - Useful for removing multiple test variations

3. **`scripts/clean/verify-test-prompts-removed.ts`**
   - Verifies test prompts are removed
   - Checks search results
   - Provides verification report

4. **`scripts/clean/README.md`**
   - Documentation for cleanup scripts
   - Instructions for cache clearing
   - Verification steps

## Step-by-Step Process

### 1. Search for Test Prompts

First, verify what test prompts exist:

```bash
npm run clean:verify
```

This will show you:
- If "Test Slug Generation 123" exists
- Any other test-related prompts
- Test prompts in search results

### 2. Remove Test Prompts

**Option A: Remove specific prompt**
```bash
npm run clean:test-prompts
```

**Option B: Remove all test prompts**
```bash
npm run clean:all-test-prompts
```

### 3. Clear Caches

After deletion, clear Next.js ISR cache:

**For Development:**
```bash
npm run build
```

**For Production (Vercel):**
- Go to Vercel Dashboard → Project → Settings → Data Cache
- Click "Purge Everything" or purge specific paths:
  - `/browse`
  - `/prompts/[slug]`
  - `/packs`
  - `/search`

### 4. Verify Removal

Run verification again:

```bash
npm run clean:verify
```

### 5. Manual Checks

Verify the following:

- ✅ Search results (`/search?q=test`) don't include test prompts
- ✅ Browse page (`/browse`) doesn't show test prompts
- ✅ Prompt detail page (`/prompts/[test-slug]`) returns 404
- ✅ Related prompts don't reference test prompts
- ✅ Packs page doesn't reference test prompts

## Codebase Search Results

We searched the entire codebase for:
- "Test Slug Generation 123"
- "test slug generation"
- "slug-generation"
- "test-slug"

**Result:** No hardcoded references found in:
- Seed files
- Static data files
- Component code
- API routes

The test prompt only exists in the database, which is why we need the cleanup scripts.

## Database Cleanup

The scripts use Supabase's service role key to:
1. Query prompts matching test patterns
2. Display what will be deleted
3. Delete matching prompts
4. Provide confirmation

## Cache Clearing

After deletion, these routes may be cached:
- `/browse` - ISR cache
- `/prompts/[slug]` - Dynamic route cache
- `/packs` - ISR cache
- `/search` - API route cache (60s)

**Cache Control Headers:**
- API routes: `s-maxage=60, stale-while-revalidate=300`
- Pages: Next.js default ISR behavior

## Troubleshooting

### Script fails with "Missing environment variables"

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Test prompt still appears after deletion

1. Clear browser cache
2. Rebuild the application: `npm run build`
3. Clear Vercel cache (if deployed)
4. Wait for cache expiration (60s for API routes)

### Verification shows test prompts still exist

1. Check if deletion actually succeeded:
   ```bash
   npm run clean:verify
   ```
2. If prompts still exist, try deleting again:
   ```bash
   npm run clean:all-test-prompts
   ```
3. Check Supabase dashboard directly

## Related Files

- `app/actions.ts` - Contains `revalidatePath` functions
- `app/api/prompts/route.ts` - API route with cache headers
- `app/api/search/route.ts` - Search API with cache headers
- `scripts/clean/README.md` - Detailed script documentation

## Prevention

To prevent test prompts in the future:

1. **Don't create test prompts in production database**
2. **Use a separate test database for development**
3. **Add validation to prevent "test" titles** (optional)
4. **Run cleanup scripts regularly** if test data is created

## Summary

✅ Created cleanup scripts for removing test prompts
✅ Added verification script to confirm removal
✅ Documented cache clearing process
✅ No hardcoded references found in codebase
✅ Scripts ready to use with npm commands

The test prompt "Test Slug Generation 123" can now be safely removed from the database using the provided scripts.

