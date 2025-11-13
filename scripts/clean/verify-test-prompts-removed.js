require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verifyTestPromptsRemoved() {
  console.log('🔍 Verifying test prompts are removed...\n');

  // Check for "Test Slug Generation 123" specifically
  const { data: specificPrompt, error: specificError } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .ilike('title', '%Test Slug Generation 123%')
    .maybeSingle();

  if (specificError) {
    console.error('❌ Error checking for specific prompt:', specificError.message);
    process.exit(1);
  }

  if (specificPrompt) {
    console.error('❌ FAILED: "Test Slug Generation 123" still exists!');
    console.error(`   ID: ${specificPrompt.id}`);
    console.error(`   Slug: ${specificPrompt.slug || 'N/A'}`);
    process.exit(1);
  }

  console.log('✅ "Test Slug Generation 123" not found');

  // Check for any test-related prompts
  const { data: testPrompts, error: testError } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .or('title.ilike.%test slug%,title.ilike.%test-slug%,title.ilike.%Test Slug%,title.ilike.%test generation%,title.ilike.%Test Generation%');

  if (testError) {
    console.error('❌ Error checking for test prompts:', testError.message);
    process.exit(1);
  }

  if (testPrompts && testPrompts.length > 0) {
    console.warn(`\n⚠️  Found ${testPrompts.length} other test-related prompt(s):`);
    testPrompts.forEach((p) => {
      console.warn(`   - "${p.title}" (ID: ${p.id})`);
    });
    console.warn('\n💡 Run "npm run clean:all-test-prompts" to remove them');
  } else {
    console.log('✅ No test-related prompts found');
  }

  // Check search results
  console.log('\n🔍 Checking search results...');
  const { data: searchResults } = await supabase
    .from('prompts')
    .select('id, title')
    .ilike('title', '%test%')
    .limit(10);

  if (searchResults && searchResults.length > 0) {
    const testMatches = searchResults.filter((p) =>
      /test\s*(slug|generation)/i.test(p.title || '')
    );
    if (testMatches.length > 0) {
      console.warn(`⚠️  Found ${testMatches.length} test prompt(s) in search results:`);
      testMatches.forEach((p) => {
        console.warn(`   - "${p.title}"`);
      });
    } else {
      console.log('✅ No test prompts in search results');
    }
  } else {
    console.log('✅ No test-related prompts found in search');
  }

  console.log('\n✅ Verification complete!');
}

verifyTestPromptsRemoved().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

