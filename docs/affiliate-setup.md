# Affiliate System Setup

This document explains how to set up the database-driven affiliate system with commission-based ranking.

## 1. Database Migration

Run the SQL migration to create the `affiliates` table:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/001_create_affiliates_table.sql
```

Or manually execute:

```sql
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT[] NOT NULL,
  affiliate_url TEXT NOT NULL,
  commission_value NUMERIC NOT NULL DEFAULT 0,
  commission_type TEXT NOT NULL DEFAULT 'revshare',
  cookie_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_category ON affiliates USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_affiliates_active ON affiliates(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliates_commission ON affiliates(commission_value DESC);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active affiliates"
  ON affiliates
  FOR SELECT
  USING (is_active = true);
```

## 2. Seed Affiliate Data

Run the seed script to populate initial affiliate data:

```bash
node scripts/seed-affiliates.mjs
```

This will insert/update 12 affiliate companies:
- **Webflow** (50% revshare, 90 days)
- **Framer** (50% revshare, 60 days)
- **Mixo AI** (20% revshare, 90 days)
- **Copy.ai** (45% revshare, 90 days)
- **Jasper** (30% revshare, 60 days)
- **Notion** (20% revshare, 90 days)
- **Leonardo.ai** (60% revshare, 30 days)
- **Imagine.art** (50% revshare, 60 days)
- **Midjourney** (0%, none)
- **Mubert** (30% revshare, 60 days)
- **SOUNDRAW** (25% CPA, 30 days)
- **Soundswoop** (0%, none)

## 3. How It Works

### Affiliate Selection Logic

The system automatically selects the **highest-paying active affiliate** for each prompt category:

1. **Category Matching**: Matches prompt category (e.g., "Art", "Music", "Writing") to affiliate categories
2. **Commission Ranking**: Sorts by `commission_value` (descending)
3. **Active Filter**: Only considers affiliates where `is_active = true`
4. **Fallback**: If no match found, defaults to Mixo AI

### Component Usage

**Server Components** (e.g., prompt detail page):
```tsx
import { pickAffiliateForCategoryServer } from '@/lib/affiliate-server';

const affiliate = await pickAffiliateForCategoryServer(prompt.category);
<AffiliateCTA affiliate={affiliate} category={prompt.category} />
```

**Client Components** (e.g., prompt cards):
```tsx
<AffiliateCTA category={prompt.category} small />
```

The `AffiliateCTA` component will automatically:
- Fetch affiliate on client-side if not provided
- Display emoji and description based on affiliate name/category
- Track clicks with PostHog (including commission_value and commission_type)

## 4. PostHog Tracking

Affiliate clicks are tracked with:
- `tool_name`: Affiliate name
- `tool_url`: Affiliate URL
- `commission_value`: Commission percentage
- `commission_type`: 'revshare', 'cpa', or 'none'
- `location`: 'card' or 'detail'
- Additional metadata (prompt_id, etc.)

## 5. Managing Affiliates

### Adding New Affiliates

Insert directly into Supabase or use the seed script pattern:

```sql
INSERT INTO affiliates (name, category, affiliate_url, commission_value, commission_type, cookie_days, is_active)
VALUES ('New Tool', ARRAY['art', 'design'], 'https://newtool.com/?ref=promptopedia', 40, 'revshare', 90, true);
```

### Updating Affiliates

```sql
UPDATE affiliates 
SET commission_value = 50, is_active = false 
WHERE name = 'Old Tool';
```

### Deactivating Affiliates

```sql
UPDATE affiliates SET is_active = false WHERE name = 'Inactive Tool';
```

## 6. Testing

Test affiliate selection for each category:

1. **Art prompts** → Should show Leonardo.ai (60%) or Imagine.art (50%)
2. **Music prompts** → Should show Mubert (30%) or SOUNDRAW (25%)
3. **Writing prompts** → Should show Copy.ai (45%) or Jasper (30%)
4. **Business/Coding prompts** → Should show Webflow (50%) or Framer (50%)

## 7. Optional Enhancements

Future improvements could include:

- **Caching**: Cache affiliate results to reduce Supabase calls
- **UTM Parameters**: Add `?utm_source=promptopedia&utm_medium=affiliate&utm_campaign={category}`
- **Admin Dashboard**: Add affiliate management UI in `/admin`
- **Commission Display**: Show commission rates on affiliate cards for transparency
- **A/B Testing**: Rotate between top affiliates for testing

