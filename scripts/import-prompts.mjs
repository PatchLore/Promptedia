/**
 * Import CSV Prompts Script (ES Modules)
 * 
 * Reads prompts_seed.csv and imports into Supabase
 * 
 * Usage:
 *   node scripts/import-prompts.js
 */

import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

// Check for existing prompts to avoid duplicates
async function checkExistingPrompts() {
  const { data: existingPrompts } = await supabase
    .from('prompts')
    .select('title');
  
  return new Set((existingPrompts || []).map(p => p.title?.toLowerCase().trim()));
}

async function importPrompts() {
  console.log('📖 Reading CSV file...');
  
  const csv = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
  
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Allow flexible column counts for misquoted CSVs
    relax_quotes: true,
    quote: '"',
    escape: '"',
    bom: true
  });

  // Filter out invalid records (should have 7 columns)
  const validRecords = records.filter(r => {
    const hasRequiredFields = r.title && r.prompt && r.category && r.type;
    if (!hasRequiredFields) {
      console.warn(`⚠️  Skipping invalid record: ${JSON.stringify(r).substring(0, 100)}...`);
      return false;
    }
    return true;
  });

  console.log(`✅ Parsed ${records.length} rows from CSV`);
  console.log(`✅ Valid records: ${validRecords.length}`);
  
  if (validRecords.length < records.length) {
    console.warn(`⚠️  Skipped ${records.length - validRecords.length} invalid records`);
  }
  console.log('');

  // Check for duplicates
  const existingTitles = await checkExistingPrompts();
  let skipped = 0;

  // Process records in batches
  for (let i = 0; i < validRecords.length; i += 20) {
    const batch = validRecords.slice(i, i + 20)
      .filter(r => {
        // Skip if already exists
        const titleLower = r.title?.toLowerCase().trim();
        if (existingTitles.has(titleLower)) {
          skipped++;
          return false;
        }
        return true;
      })
      .map(r => ({
        title: r.title,
        prompt: r.prompt,
        category: r.category,
        type: r.type,
        tags: r.tags ? r.tags.replace(/[{}]/g, "").split(",").map(t => t.trim()).filter(t => t) : [],
        is_public: r.is_public === "true" || r.is_public === true,
        is_pro: r.is_pro === "true" || r.is_pro === true,
        user_id: null
      }));

    if (batch.length === 0) {
      console.log(`⚠️  Batch ${Math.floor(i / 20) + 1}: All prompts already exist, skipping...`);
      continue;
    }

    const { error, data } = await supabase.from("prompts").insert(batch).select();
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / 20) + 1}:`, error.message);
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / 20) + 1}: ${data?.length || 0} prompts`);
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`📝 Total in CSV: ${records.length}`);
  console.log(`✅ Valid records: ${validRecords.length}`);
  console.log(`🔄 Duplicates skipped: ${skipped}`);
  console.log('');
  console.log('✅ Import complete. Check Supabase for total rows.');
  console.log('');
  console.log('💡 Run this SQL to verify:');
  console.log('   select category, count(*) from prompts group by category;');
}

// Run the import
importPrompts().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

