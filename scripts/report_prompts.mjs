/**
 * report_prompts.mjs — Diagnostic report on prompt data quality
 * 
 * Queries Supabase and prints counts of prompts with missing data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function reportPrompts() {
  console.log('🔍 Fetching prompt data quality report...\n');

  // Get all prompts
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, title, thumbnail_url, description, audio_preview_url, category, slug');

  if (error) {
    console.error('❌ Error fetching prompts:', error.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('ℹ️  No prompts found.');
    return;
  }

  const total = prompts.length;
  const withPlaceholderThumbnail = prompts.filter(
    p => !p.thumbnail_url || 
         p.thumbnail_url.includes('placeholder') || 
         p.thumbnail_url === '/images/placeholder.svg'
  ).length;
  const withNullThumbnail = prompts.filter(p => !p.thumbnail_url || p.thumbnail_url === '').length;
  const withNullDescription = prompts.filter(p => !p.description || p.description.trim() === '').length;
  const withNullAudio = prompts.filter(p => p.category === 'Music' && (!p.audio_preview_url || p.audio_preview_url === '')).length;
  const withNullSlug = prompts.filter(p => !p.slug || p.slug.trim() === '').length;

  console.log('📊 PROMPT DATA QUALITY REPORT');
  console.log('='.repeat(60));
  console.log(`Total prompts: ${total}`);
  console.log(`\nThumbnails:`);
  console.log(`  ❌ Null/empty: ${withNullThumbnail}`);
  console.log(`  ⚠️  Placeholder: ${withPlaceholderThumbnail}`);
  console.log(`  ✅ Has real URL: ${total - withPlaceholderThumbnail}`);
  console.log(`\nDescriptions:`);
  console.log(`  ❌ Null/empty: ${withNullDescription}`);
  console.log(`  ✅ Has description: ${total - withNullDescription}`);
  console.log(`\nAudio (Music prompts only):`);
  const musicPrompts = prompts.filter(p => p.category === 'Music').length;
  console.log(`  Total Music prompts: ${musicPrompts}`);
  console.log(`  ❌ Missing audio_preview_url: ${withNullAudio}`);
  console.log(`  ✅ Has audio: ${musicPrompts - withNullAudio}`);
  console.log(`\nSlugs:`);
  console.log(`  ❌ Missing slug: ${withNullSlug}`);
  console.log(`  ✅ Has slug: ${total - withNullSlug}`);
  console.log('\n' + '='.repeat(60));
}

reportPrompts()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });

