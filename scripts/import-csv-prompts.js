/**
 * Import CSV Prompts Script
 * 
 * Reads prompts_seed.csv and imports into Supabase
 * 
 * Usage:
 *   node scripts/import-csv-prompts.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Using csv-parse library for proper CSV parsing

/**
 * Parse tags from string format "{tag1,tag2,tag3}" to array
 */
function parseTags(tagString) {
  if (!tagString || tagString === '{}') {
    return [];
  }
  
  // Remove curly braces and split by comma
  const cleaned = tagString.replace(/^\{|\}$/g, '');
  if (!cleaned) {
    return [];
  }
  
  return cleaned.split(',').map(tag => tag.trim()).filter(tag => tag);
}

/**
 * Parse boolean string
 */
function parseBoolean(value) {
  return value === 'true' || value === '1';
}

/**
 * Main import function
 */
async function importCSV() {
  const csvPath = path.join(__dirname, 'prompts_seed.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Use csv-parse to properly handle quoted fields with commas
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`✅ Found ${records.length} prompts to import`);
  console.log('');

  const prompts = [];
  let errors = 0;

  // Parse data rows
  for (let i = 0; i < records.length; i++) {
    try {
      const row = records[i];
      
      // Check for required fields
      if (!row.title || !row.prompt) {
        console.warn(`⚠️  Row ${i + 2}: Missing title or prompt, skipping`);
        errors++;
        continue;
      }

      // Convert to proper format
      const prompt = {
        title: row.title || null,
        prompt: row.prompt || null,
        category: row.category || null,
        type: row.type || null,
        tags: parseTags(row.tags),
        is_public: parseBoolean(row.is_public),
        is_pro: parseBoolean(row.is_pro),
        user_id: null,
      };

      prompts.push(prompt);
    } catch (error) {
      console.error(`❌ Error parsing row ${i + 2}:`, error.message);
      errors++;
    }
  }

  console.log(`📊 Parsed ${prompts.length} prompts (${errors} errors)`);
  console.log('');

  if (prompts.length === 0) {
    console.error('❌ No valid prompts to import');
    process.exit(1);
  }

  // Check for existing prompts to avoid duplicates
  console.log('🔍 Checking for existing prompts...');
  const { data: existingPrompts } = await supabase
    .from('prompts')
    .select('title');

  const existingTitles = new Set((existingPrompts || []).map(p => p.title?.toLowerCase().trim()));
  
  // Filter out duplicates
  const newPrompts = prompts.filter(p => {
    const titleLower = p.title?.toLowerCase().trim();
    if (existingTitles.has(titleLower)) {
      return false;
    }
    return true;
  });

  const duplicates = prompts.length - newPrompts.length;
  if (duplicates > 0) {
    console.log(`⚠️  Skipping ${duplicates} duplicate prompts (already in database)`);
    console.log('');
  }

  if (newPrompts.length === 0) {
    console.log('✅ All prompts already exist in database!');
    return;
  }

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;

  console.log(`💾 Inserting ${newPrompts.length} new prompts into Supabase...`);
  console.log('');

  for (let i = 0; i < newPrompts.length; i += batchSize) {
    const batch = newPrompts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(newPrompts.length / batchSize);

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
        failed += batch.length;
      } else {
        inserted += data?.length || 0;
        console.log(`✅ Batch ${batchNum}/${totalBatches}: Inserted ${data?.length || 0} prompts`);
      }
    } catch (error) {
      console.error(`❌ Batch ${batchNum}/${totalBatches} error:`, error.message);
      failed += batch.length;
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`📝 Total in CSV: ${prompts.length}`);
  console.log(`🔄 Duplicates skipped: ${duplicates}`);
  console.log(`✅ Successfully inserted: ${inserted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');
  
  if (inserted > 0) {
    console.log('🎉 Import complete!');
    console.log('   Visit http://localhost:3000/admin to manage prompts.');
  } else if (duplicates > 0) {
    console.log('ℹ️  All prompts already exist in database.');
  }
}

// Run the import
importCSV().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

