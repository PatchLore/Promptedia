/**
 * Clean ALL prompts and re-import fresh
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import { parse } from "csv-parse/sync";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];

async function cleanAndReimport() {
  console.log('🧹 Deleting ALL existing prompts...');
  const { error: deleteError } = await supabase.from('prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('❌ Delete error:', deleteError.message);
  } else {
    console.log('✅ All prompts deleted');
  }
  
  console.log('\n📖 Reading CSV...');
  const csvData = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
  const lines = csvData.split('\n').filter(l => l.trim());
  
  const fixedRecords = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Find category by searching for valid category names
    let categoryFound = null;
    let categoryIndex = -1;
    
    for (const cat of validCategories) {
      const index = line.indexOf(',' + cat + ',');
      if (index !== -1) {
        categoryFound = cat;
        categoryIndex = index;
        break;
      }
    }
    
    if (categoryFound && categoryIndex !== -1) {
      // Split line at category
      const before = line.slice(0, categoryIndex);
      const after = line.slice(categoryIndex + categoryFound.length + 1);
      
      // Extract title (first field before category)
      const titleIndex = before.indexOf(',');
      if (titleIndex !== -1) {
        const title = before.slice(0, titleIndex).trim();
        const prompt = before.slice(titleIndex + 1).trim();
        
        // Extract type (after category)
        const typeMatch = after.match(/^(image|audio|text),/);
        if (typeMatch) {
          const type = typeMatch[1];
          const rest = after.slice(type.length + 1);
          
          // Extract tags (quoted with {})
          const tagsMatch = rest.match(/"({[^}]+})"/);
          const tags = tagsMatch ? tagsMatch[1] : '';
          
          // Extract booleans (last two fields)
          const bools = rest.split(',').slice(-2);
          const is_public = bools[0]?.trim() === 'true';
          const is_pro = bools[1]?.trim() === 'true';
          
          fixedRecords.push({ title, prompt, category: categoryFound, type, tags, is_public, is_pro });
        }
      }
    }
  }
  
  console.log(`✅ Fixed ${fixedRecords.length} records\n`);
  
  // Import in batches
  const batchSize = 20;
  let inserted = 0;
  
  for (let i = 0; i < fixedRecords.length; i += batchSize) {
    const batch = fixedRecords.slice(i, i + batchSize).map(r => ({
      title: r.title,
      prompt: r.prompt,
      category: r.category,
      type: r.type,
      tags: r.tags ? r.tags.replace(/[{}]/g, "").split(",").map(t => t.trim()).filter(t => t) : [],
      is_public: r.is_public,
      is_pro: r.is_pro,
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

cleanAndReimport().catch(console.error);



