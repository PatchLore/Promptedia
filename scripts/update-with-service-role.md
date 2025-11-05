# Updating example_url with Service Role Key

The RLS (Row Level Security) policies only allow users to update their own prompts. To update all prompts, you have two options:

## Option 1: Use Service Role Key (Recommended)

1. Get your Service Role Key from Supabase Dashboard → Settings → API
2. Update the script to use it temporarily (or create a new script)
3. Run the update

## Option 2: Update RLS Policy

Run this SQL in Supabase SQL Editor to allow updates to public prompts:

```sql
-- Allow updates to public prompts (for admin tasks)
CREATE POLICY "Allow updates to public prompts"
ON prompts FOR UPDATE
USING (is_public = true)
WITH CHECK (is_public = true);
```

Then run the update script again.



