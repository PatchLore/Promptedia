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

async function removeTestPrompts() {
  console.log('🔍 Searching for test prompts...\n');

  // First, find all matching prompts
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, slug, category')
    .ilike('title', '%test slug generation%');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('✅ No test prompts found matching "test slug generation"');
    
    // Also check for variations
    const { data: allTestPrompts } = await supabase
      .from('prompts')
      .select('id, title, slug, category')
      .or('title.ilike.%test slug%,title.ilike.%test-slug%,title.ilike.%Test Slug%');

    if (allTestPrompts && allTestPrompts.length > 0) {
      console.log(`\n⚠️  Found ${allTestPrompts.length} other test-related prompt(s):`);
      allTestPrompts.forEach((p) => {
        console.log(`   - "${p.title}" (ID: ${p.id}, Slug: ${p.slug || 'N/A'})`);
      });
      console.log('\n💡 Run "npm run clean:all-test-prompts" to remove all test prompts');
    }
    
    return;
  }

  console.log(`⚠️  Found ${prompts.length} test prompt(s) to remove:\n`);
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
  console.log('   2. Verify prompt no longer appears in search results');
  console.log('   3. Check related prompts sections');
}

// Run the cleanup
removeTestPrompts().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

