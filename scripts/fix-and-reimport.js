/**
 * Fix CSV and re-import with proper quoting
 */

import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];

async function fixAndReimport() {
  console.log('📖 Reading CSV file...');
  const csvData = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
  
  // Parse with manual reconstruction
  const lines = csvData.split('\n').filter(l => l.trim());
  const header = lines[0];
  const fixedRecords = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Manual parsing - find the pattern: title, prompt (with possible commas), category, type, tags, is_public, is_pro
    // Categories are always: Art, Music, Writing, Business, Coding
    // Types are always: image, audio, text
    // So we can search backwards from the end
    
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    // Parse from the end backwards since we know the last 3 fields are: tags (quoted), is_public, is_pro
    const endParts = line.match(/,"{[^}]+}",(true|false),(true|false)$/);
    if (endParts) {
      const endMatch = endParts[0];
      const mainPart = line.slice(0, line.length - endMatch.length);
      
      // Now parse main part: title, prompt (with commas), category, type
      // Find the category by looking for one of the valid categories
      let categoryFound = null;
      let categoryIndex = -1;
      
      for (const cat of validCategories) {
        const index = mainPart.lastIndexOf(',' + cat + ',');
        if (index !== -1) {
          categoryFound = cat;
          categoryIndex = index;
          break;
        }
      }
      
      if (categoryFound && categoryIndex !== -1) {
        // Split at category
        const beforeCategory = mainPart.slice(0, categoryIndex);
        const afterCategory = mainPart.slice(categoryIndex + categoryFound.length + 1);
        
        // Find type after category
        const typeMatch = afterCategory.match(/^(image|audio|text),/);
        if (typeMatch) {
          const type = typeMatch[1];
          
          // Split title and prompt
          const titleIndex = beforeCategory.indexOf(',');
          if (titleIndex !== -1) {
            const title = beforeCategory.slice(0, titleIndex);
            const prompt = beforeCategory.slice(titleIndex + 1);
            
            // Extract tags and booleans from endMatch
            const tagsMatch = endMatch.match(/"({[^}]+})"/);
            const isPublicMatch = endMatch.match(/,true|false/);
            const isProMatch = endMatch.match(/,(true|false)$/);
            
            fixedRecords.push({
              title: title.trim(),
              prompt: prompt.trim(),
              category: categoryFound,
              type: type,
              tags: tagsMatch ? tagsMatch[1] : '',
              is_public: isPublicMatch && isPublicMatch[0].includes('true') ? 'true' : 'false',
              is_pro: isProMatch && isProMatch[1] === 'true' ? 'true' : 'false'
            });
            continue;
          }
        }
      }
    }
    
    // Fallback: try csv-parse with relaxed settings
    try {
      const parsed = parse(line, {
        columns: false,
        relax_column_count: true,
        relax_quotes: true
      });
      
      if (parsed[0] && parsed[0].length >= 4) {
        const row = parsed[0];
        // Try to find valid category
        const categoryIndex = row.findIndex(c => validCategories.includes(c));
        if (categoryIndex >= 2) {
          const title = row[0];
          const prompt = row.slice(1, categoryIndex).join(', ');
          const category = row[categoryIndex];
          const type = row[categoryIndex + 1] || 'text';
          const tags = row.find(c => c.includes('{')) || '';
          const is_public = row[row.length - 2] === 'true' || row[row.length - 2] === true;
          const is_pro = row[row.length - 1] === 'true' || row[row.length - 1] === true;
          
          fixedRecords.push({
            title: title?.trim() || '',
            prompt: prompt?.trim() || '',
            category: category,
            type: type,
            tags: tags,
            is_public: is_public ? 'true' : 'false',
            is_pro: is_pro ? 'true' : 'false'
          });
        }
      }
    } catch (e) {
      console.warn(`⚠️  Could not parse line ${i + 1}: ${line.substring(0, 50)}...`);
    }
  }
  
  console.log(`✅ Fixed ${fixedRecords.length} records`);
  
  // Clean invalid categories from database
  console.log('\n🧹 Cleaning database...');
  const { error: deleteError } = await supabase
    .from('prompts')
    .delete()
    .not('category', 'in', `(${validCategories.map(c => `"${c}"`).join(',')})`);
  
  if (deleteError) {
    console.error('❌ Error cleaning:', deleteError.message);
  } else {
    console.log('✅ Cleaned invalid records');
  }
  
  // Re-import fixed records
  console.log('\n💾 Importing fixed records...');
  const batchSize = 20;
  let inserted = 0;
  
  for (let i = 0; i < fixedRecords.length; i += batchSize) {
    const batch = fixedRecords.slice(i, i + batchSize).map(r => ({
      title: r.title,
      prompt: r.prompt,
      category: r.category,
      type: r.type,
      tags: r.tags ? r.tags.replace(/[{}]/g, "").split(",").map(t => t.trim()).filter(t => t) : [],
      is_public: r.is_public === 'true',
      is_pro: r.is_pro === 'true',
      user_id: null
    }));
    
    const { error } = await supabase.from("prompts").insert(batch);
    
    if (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} prompts`);
    }
  }
  
  console.log(`\n🎉 Imported ${inserted} prompts successfully!`);
}

fixAndReimport().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



