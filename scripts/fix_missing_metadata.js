/**
 * fix_missing_metadata.js — Clean up missing metadata for Supabase prompts
 * Final version aligned to your actual schema
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

async function runFixMissingMetadata() {
  console.log('🔍 Fetching prompts requiring metadata cleanup...');

  // ✅ Select only columns you actually have
  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, description, tags, thumbnail_url');

  if (error) {
    console.error('❌ Error fetching prompts:', error);
    process.exit(1);
  }

  console.log(`✅ Retrieved ${data.length} prompts for metadata check`);

  const updates = [];
  const FALLBACK_TITLE = 'Unnamed Prompt';
  const FALLBACK_DESCRIPTION = 'No description available.';
  const FALLBACK_TAGS = ['untagged'];
  const FALLBACK_THUMBNAIL = '/images/placeholder.svg';

  for (const prompt of data) {
    let changed = false;

    // ✅ Title fallback
    let newTitle = prompt.title;
    if (!newTitle || typeof newTitle !== 'string' || newTitle.trim().length < 1) {
      newTitle = FALLBACK_TITLE;
      changed = true;
    }

    // ✅ Description fallback
    let newDescription = prompt.description;
    if (!newDescription || typeof newDescription !== 'string' || newDescription.trim().length < 3) {
      newDescription = FALLBACK_DESCRIPTION;
      changed = true;
    }

    // ✅ Tags fallback
    let newTags = prompt.tags;
    if (!Array.isArray(newTags) || newTags.length === 0) {
      newTags = FALLBACK_TAGS;
      changed = true;
    }

    // ✅ Thumbnail fallback
    let newThumb = prompt.thumbnail_url;
    if (!newThumb || typeof newThumb !== 'string' || !newThumb.startsWith('http')) {
      newThumb = FALLBACK_THUMBNAIL;
      changed = true;
    }

    if (changed) {
      updates.push({
        id: prompt.id,
        title: newTitle,
        description: newDescription,
        tags: newTags,
        thumbnail_url: newThumb,
      });
    }
  }

  if (updates.length === 0) {
    console.log('✅ All prompts already have valid metadata.');
    return;
  }

  console.log(`🔧 Updating ${updates.length} prompts...`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);

    const { error: updateError } = await supabase
      .from('prompts')
      .upsert(batch, {
        onConflict: 'id',
      });

    if (updateError) {
      console.error('❌ Error updating batch:', updateError);
    } else {
      console.log(`✅ Updated ${batch.length} prompts`);
    }
  }

  console.log('✅ Metadata fallback cleanup complete.');
}

runFixMissingMetadata();


