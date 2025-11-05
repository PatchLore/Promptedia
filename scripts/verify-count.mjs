/**
 * Quick script to verify prompt counts by category
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function verifyCounts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('category');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  const counts = {};
  data.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  console.log('\n📊 Prompt Counts by Category:');
  console.log('='.repeat(40));
  Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([category, count]) => {
      console.log(`  ${category.padEnd(15)} ${count}`);
    });
  
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  console.log('='.repeat(40));
  console.log(`  Total: ${total}`);
  console.log('');
}

verifyCounts().catch(console.error);



