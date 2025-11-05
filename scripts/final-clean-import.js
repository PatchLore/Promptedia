/**
 * Final clean import - properly parse CSV and import
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import { parse } from "csv-parse/sync";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];

async function finalImport() {
  console.log('🧹 Deleting ALL prompts...');
  await supabase.from('prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Deleted\n');
  
  console.log('📖 Parsing CSV...');
  const csv = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
  
  // Read line by line and manually reconstruct
  const lines = csv.split('\n').filter(l => l.trim());
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Try to find a valid category in the line
    let bestMatch = null;
    let bestIndex = -1;
    
    for (const cat of validCategories) {
      const pattern = ',' + cat + ',';
      const idx = line.indexOf(pattern);
      if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
        bestMatch = cat;
        bestIndex = idx;
      }
    }
    
    if (bestMatch && bestIndex !== -1) {
      // Split at category (pattern is ',Category,' so start after the comma)
      const before = line.substring(0, bestIndex);
      const after = line.substring(bestIndex + bestMatch.length + 2); // +2 for ',Category,'
      
      // Title is first field
      const titleEnd = before.indexOf(',');
      if (titleEnd === -1) {
        if (i <= 3) console.log(`  Line ${i}: No title separator found`);
        continue;
      }
      
      const title = before.substring(0, titleEnd).trim();
      const prompt = before.substring(titleEnd + 1).trim();
      
      // Type is after category
      const typeMatch = after.match(/^(image|audio|text),/);
      if (!typeMatch) {
        if (i <= 3) console.log(`  Line ${i}: No type match found in: ${after.substring(0, 20)}...`);
        continue;
      }
      
      const type = typeMatch[1];
      const rest = after.substring(type.length + 1);
      
      // Tags are in quotes with {}
      const tagsMatch = rest.match(/"({[^}]+})"/);
      const tags = tagsMatch ? tagsMatch[1] : '';
      
      // Last two are booleans
      const parts = rest.split(',');
      const is_public = parts[parts.length - 2]?.trim() === 'true';
      const is_pro = parts[parts.length - 1]?.trim() === 'true';
      
      records.push({ title, prompt, category: bestMatch, type, tags, is_public, is_pro });
    } else if (i <= 3) {
      console.log(`  Line ${i}: No category found`);
    }
  }
  
  console.log(`✅ Parsed ${records.length} valid records\n`);
  
  // Import
  const batchSize = 20;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map(r => ({
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
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} prompts`);
    }
  }
  
  console.log(`\n🎉 Done! Imported ${records.length} prompts`);
}

finalImport().catch(console.error);

