/**
 * fix_prompt_thumbnails.js — Backfill missing prompt thumbnails with fallback image
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

async function fixThumbnails() {
  console.log('🔍 Fetching prompts to check thumbnails...');

  const { data, error } = await supabase
    .from('prompts')
    .select('id, thumbnail_url');

  if (error) {
    console.error('❌ Error fetching prompts:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No prompts found.');
    return;
  }

  console.log(`📊 Found ${data.length} prompts to check.`);

  let updatedCount = 0;

  for (const prompt of data) {
    if (!prompt.thumbnail_url || prompt.thumbnail_url.trim() === '') {
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ thumbnail_url: FALLBACK_IMAGE })
        .eq('id', prompt.id);

      if (updateError) {
        console.error(`❌ Error updating prompt ${prompt.id}:`, updateError);
      } else {
        console.log(`✅ Updated thumbnail for prompt ${prompt.id}`);
        updatedCount++;
      }
    }
  }

  console.log(`🎨 Done updating thumbnails. Updated ${updatedCount} prompt(s).`);
}

fixThumbnails()
  .then(() => {
    console.log('✨ Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });

