/**
 * fix_missing_descriptions.mjs — Auto-generate missing descriptions from prompt text
 * 
 * Finds prompts with null or empty descriptions and creates a short preview
 * from the prompt text itself.
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

/**
 * Generate a description from prompt text
 */
function generateDescription(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    return null;
  }

  // Remove extra whitespace and newlines
  const cleaned = promptText.trim().replace(/\s+/g, ' ');
  
  // Take first 140 characters and add ellipsis
  if (cleaned.length <= 140) {
    return cleaned;
  }

  // Try to cut at a sentence boundary
  const truncated = cleaned.slice(0, 140);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastPeriod > 100) {
    return truncated.slice(0, lastPeriod + 1);
  }

  if (lastSpace > 100) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

async function fixMissingDescriptions() {
  console.log('🔍 Fetching prompts with missing descriptions...\n');

  // Find prompts where description is null, empty, or very short
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, prompt, description')
    .or('description.is.null,description.eq.,description.lt.5');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('✅ All prompts already have descriptions!');
    return;
  }

  console.log(`📊 Found ${prompts.length} prompts needing descriptions\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const prompt of prompts) {
    // Skip if prompt text is also missing
    if (!prompt.prompt || prompt.prompt.trim().length === 0) {
      console.log(`⏭️  Skipping "${prompt.title}" - no prompt text available`);
      skipped++;
      continue;
    }

    const newDescription = generateDescription(prompt.prompt);

    if (!newDescription) {
      console.log(`⏭️  Skipping "${prompt.title}" - couldn't generate description`);
      skipped++;
      continue;
    }

    // Check if description already exists and is meaningful
    if (prompt.description && prompt.description.trim().length > 5) {
      console.log(`⏭️  Skipping "${prompt.title}" - already has description`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('prompts')
      .update({ description: newDescription })
      .eq('id', prompt.id);

    if (updateError) {
      console.error(`❌ Error updating "${prompt.title}":`, updateError.message);
      errors++;
    } else {
      console.log(`✅ Updated: ${prompt.title}`);
      console.log(`   Description: ${newDescription.slice(0, 60)}...`);
      updated++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n🎉 Done!`);
}

fixMissingDescriptions()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });

