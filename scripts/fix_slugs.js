/**
 * fix_slugs.js — Resolve duplicate slugs in Supabase
 * CommonJS version — compatible with Node.js v22+
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ✅ Load env variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// ✅ Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runFixSlugs() {
  console.log('🔍 Fetching all prompts from Supabase...');

  const { data, error } = await supabase
    .from('prompts')
    .select('id, slug');

  if (error) {
    console.error('❌ Error fetching prompts:', error);
    process.exit(1);
  }

  console.log(`✅ Retrieved ${data.length} prompts`);

  // Track duplicates
  const slugMap = new Map();

  // Build map
  for (const prompt of data) {
    const slug = prompt.slug ? prompt.slug.trim() : '';
    if (!slug) continue;

    if (!slugMap.has(slug)) {
      slugMap.set(slug, [prompt.id]);
    } else {
      slugMap.get(slug).push(prompt.id);
    }
  }

  let updates = [];

  // Process duplicates
  for (const [slug, ids] of slugMap.entries()) {
    if (ids.length <= 1) continue;

    console.log(`⚠️ Duplicate slug found: "${slug}" (${ids.length} occurrences)`);

    // First ID keeps original
    for (let i = 1; i < ids.length; i++) {
      const newSlug = `${slug}-${i}`;
      updates.push({
        id: ids[i],
        slug: newSlug,
      });
    }
  }

  if (updates.length === 0) {
    console.log('✅ No duplicates found. Nothing to update.');
    return;
  }

  console.log(`🔧 Updating ${updates.length} duplicate slugs...`);

  // Batch update (100 at a time)
  const BATCH_SIZE = 100;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);

    const { error: updateError } = await supabase.from('prompts').upsert(batch, {
      onConflict: 'id',
    });

    if (updateError) {
      console.error('❌ Error updating slug batch:', updateError);
    } else {
      console.log(`✅ Updated batch of ${batch.length}`);
    }
  }

  console.log('✅ Slug conflict resolution complete.');
}

// Run immediately
runFixSlugs();


