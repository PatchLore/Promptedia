require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function removeAllTestPrompts() {
  console.log('🔍 Searching for ALL test-related prompts...\n');

  // Find all test-related prompts with various patterns
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, slug, category')
    .or('title.ilike.%test slug%,title.ilike.%test-slug%,title.ilike.%Test Slug%,title.ilike.%test generation%,title.ilike.%Test Generation%');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('✅ No test prompts found');
    return;
  }

  console.log(`⚠️  Found ${prompts.length} test-related prompt(s) to remove:\n`);
  prompts.forEach((prompt, index) => {
    console.log(`   ${index + 1}. "${prompt.title}"`);
    console.log(`      ID: ${prompt.id}`);
    console.log(`      Slug: ${prompt.slug || 'N/A'}`);
    console.log(`      Category: ${prompt.category || 'N/A'}\n`);
  });

  // Delete the prompts
  const ids = prompts.map((p) => p.id);
  const { error: deleteError } = await supabase
    .from('prompts')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('❌ Error deleting prompts:', deleteError.message);
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${prompts.length} test prompt(s)`);
  console.log('\n📋 Next steps:');
  console.log('   1. Clear Next.js ISR cache for affected routes');
  console.log('   2. Verify prompts no longer appear in search results');
  console.log('   3. Check related prompts sections');
}

// Run the cleanup
removeAllTestPrompts().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

