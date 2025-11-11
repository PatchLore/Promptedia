/**
 * fix_tags.js — Normalize tags for all prompts in Supabase
 * CommonJS version — compatible with Node.js v22+
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ✅ Load environment variables safely
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// ✅ Initialize Supabase client with service role key (write access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runFixTags() {
  console.log('🔍 Fetching all prompts from Supabase...');

  // Get all prompts
  const { data, error } = await supabase
    .from('prompts')
    .select('id, tags');

  if (error) {
    console.error('❌ Error fetching prompts:', error);
    process.exit(1);
  }

  console.log(`✅ Retrieved ${data.length} prompts`);

  let updatedCount = 0;

  // Batch size (100 items per write to avoid rate limits)
  const BATCH_SIZE = 100;
  let batch = [];

  for (const prompt of data) {
    let tags = prompt.tags;

    if (!Array.isArray(tags) || tags.length === 0) {
      tags = ['untagged'];
    } else {
      tags = tags
        .map((t) => (typeof t === 'string' ? t.toLowerCase().trim() : ''))
        .filter(Boolean);

      // dedupe list
      tags = [...new Set(tags)];

      if (tags.length === 0) {
        tags = ['untagged'];
      }
    }

    // Add to batch
    batch.push({ id: prompt.id, tags });

    // Execute when batch fills
    if (batch.length >= BATCH_SIZE) {
      await processBatch(batch);
      updatedCount += batch.length;
      batch = [];
    }
  }

  // Final batch
  if (batch.length > 0) {
    await processBatch(batch);
    updatedCount += batch.length;
  }

  console.log(`✅ Completed tag normalization.`);
  console.log(`🔧 Updated ${updatedCount} prompts.`);
  console.log(`✅ Done.`);
}

async function processBatch(batch) {
  console.log(`🔧 Updating batch of ${batch.length} prompts...`);

  const updates = batch.map((item) => ({
    id: item.id,
    tags: item.tags,
  }));

  const { error } = await supabase.from('prompts').upsert(updates, {
    onConflict: 'id',
  });

  if (error) {
    console.error('❌ Error during update:', error);
  } else {
    console.log(`✅ Batch updated successfully.`);
  }
}

// ⏳ Run the script immediately
runFixTags();


