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

// Read the CSV safely (with quoted commas handled)
const csvData = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true, // Handle misaligned columns from unquoted commas
  relax_quotes: true
});

console.log(`📦 Parsed ${records.length} rows from CSV`);

// Valid categories and types to filter invalid records
const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];
const validTypes = ['image', 'audio', 'text'];

function isValidRecord(r) {
  // Check if category is valid (not a fragment of prompt text)
  if (!r.category || !validCategories.includes(r.category)) {
    return false;
  }
  
  // Check if type is valid
  if (!r.type || !validTypes.includes(r.type)) {
    return false;
  }
  
  // Check if title exists
  if (!r.title || r.title.trim().length === 0) {
    return false;
  }
  
  // Check if prompt exists
  if (!r.prompt || r.prompt.trim().length === 0) {
    return false;
  }
  
  return true;
}

async function importPrompts() {
  // Filter out invalid records (those with misparsed columns)
  const validRecords = records.filter(isValidRecord);
  
  console.log(`✅ Valid records: ${validRecords.length} (filtered out ${records.length - validRecords.length} invalid)`);
  
  if (validRecords.length === 0) {
    console.error('❌ No valid records found! Check CSV format.');
    process.exit(1);
  }

  for (let i = 0; i < validRecords.length; i += 20) {
    const batch = validRecords.slice(i, i + 20).map((r) => ({
      title: r.title,
      prompt: r.prompt,
      category: r.category,
      type: r.type,
      tags: r.tags ? r.tags.replace(/[{}]/g, "").split(",").map(t => t.trim()).filter(t => t) : [],
      is_public: r.is_public === "true" || r.is_public === true,
      is_pro: r.is_pro === "true" || r.is_pro === true,
      user_id: null
    }));

    const { error } = await supabase.from("prompts").insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / 20) + 1}:`, error.message);
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / 20) + 1}`);
    }
  }

  console.log("✅ Import complete. Check Supabase for total rows.");
}

// Run the import
importPrompts().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

