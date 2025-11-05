/**
 * Fix CSV file by properly quoting fields with commas
 */

import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const csvData = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");

// Parse with relaxed settings to get all data
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
  relax_quotes: true
});

console.log(`📖 Parsed ${records.length} records`);

// Valid categories to identify correct records
const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];
const validTypes = ['image', 'audio', 'text'];

// Fix records by reconstructing misparsed ones
const fixedRecords = [];

for (let i = 0; i < records.length; i++) {
  const r = records[i];
  
  // If category is valid, this record is likely correct
  if (r.category && validCategories.includes(r.category)) {
    fixedRecords.push({
      title: r.title,
      prompt: r.prompt,
      category: r.category,
      type: r.type,
      tags: r.tags || '',
      is_public: r.is_public || 'true',
      is_pro: r.is_pro || 'false'
    });
  } else {
    // This is a misparsed record - try to reconstruct from previous record
    // Look at the previous record to see if we can merge
    if (i > 0 && fixedRecords.length > 0) {
      const prev = fixedRecords[fixedRecords.length - 1];
      // The prompt from previous record might be incomplete
      // Merge this fragment into the prompt
      if (r.title && !validCategories.includes(r.title)) {
        // This looks like a prompt fragment
        prev.prompt = (prev.prompt || '') + ', ' + r.title;
        // Check if there are more fields that should be part of prompt
        if (r.prompt && !validCategories.includes(r.prompt)) {
          prev.prompt += ', ' + r.prompt;
        }
      }
    }
  }
}

console.log(`✅ Fixed ${fixedRecords.length} records`);

// Write fixed CSV
const fixedCsv = stringify(fixedRecords, {
  header: true,
  quoted: true,
  quoted_empty: false
});

fs.writeFileSync("./scripts/prompts_seed_fixed.csv", fixedCsv);
console.log('✅ Saved fixed CSV to prompts_seed_fixed.csv');

// Also show some examples
console.log('\n📋 Sample fixed records:');
fixedRecords.slice(0, 3).forEach((r, i) => {
  console.log(`\n${i + 1}. ${r.title}`);
  console.log(`   Category: ${r.category}, Type: ${r.type}`);
  console.log(`   Prompt: ${r.prompt.substring(0, 60)}...`);
});



