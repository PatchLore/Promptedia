-- Run this SQL in Supabase SQL Editor to allow admin updates to public prompts
-- This will allow the update script to work without requiring service role key

-- Allow updates to public prompts (for admin tasks like updating example URLs)
CREATE POLICY "Allow admin updates to public prompts"
ON prompts FOR UPDATE
USING (is_public = true)
WITH CHECK (is_public = true);

-- After running updates, you can optionally drop this policy:
-- DROP POLICY "Allow admin updates to public prompts" ON prompts;



