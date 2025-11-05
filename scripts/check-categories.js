// Script to check what categories exist in the database
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  console.log('Checking categories in database...\n');
  
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('category, title')
    .eq('is_public', true)
    .eq('is_pro', false);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.log('No prompts found in database.');
    return;
  }

  console.log(`Total prompts: ${prompts.length}\n`);
  
  // Get unique categories
  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];
  console.log('Unique categories found:');
  categories.forEach(cat => {
    const count = prompts.filter(p => p.category === cat).length;
    console.log(`  - "${cat}" (${count} prompts)`);
  });

  console.log('\nSample prompts:');
  prompts.slice(0, 5).forEach(p => {
    console.log(`  - "${p.title}" -> category: "${p.category}"`);
  });
}

checkCategories();



