// Admin script to update example_url values - requires SERVICE_ROLE_KEY
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key for admin operations (bypasses RLS)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('\n📝 To get your service role key:');
  console.log('   1. Go to Supabase Dashboard → Settings → API');
  console.log('   2. Copy the "service_role" key (NOT the anon key)');
  console.log('   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('\n⚠️  Keep this key secret! Never commit it to git.');
  process.exit(1);
}

// Use service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function ensureUrlParams(url) {
  if (!url) return url;
  
  if (url.includes('?')) {
    const [base, params] = url.split('?');
    const paramObj = new URLSearchParams(params);
    paramObj.set('w', '1280');
    paramObj.set('h', '720');
    paramObj.set('fit', 'crop');
    return `${base}?${paramObj.toString()}`;
  } else {
    return `${url}?w=1280&h=720&fit=crop`;
  }
}

async function updateFromJson() {
  const jsonPath = path.join(__dirname, 'update-images.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Config file not found: ${jsonPath}`);
    return;
  }

  const urlMap = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const mappings = Object.entries(urlMap).map(([title, url]) => ({ title, url }));

  if (mappings.length === 0) {
    console.log('No updates found in config file.');
    return;
  }

  console.log(`🔄 Updating ${mappings.length} prompts with service role key...\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const mapping of mappings) {
    const { title, url } = mapping;

    if (!title || !url) {
      console.log(`⚠️  Skipping invalid entry: ${JSON.stringify(mapping)}`);
      continue;
    }

    // Find the prompt by title
    const { data: prompts, error: findError } = await supabase
      .from('prompts')
      .select('id, title')
      .eq('title', title)
      .limit(1);

    if (findError) {
      console.error(`❌ Error finding "${title}":`, findError.message);
      errors++;
      continue;
    }

    if (!prompts || prompts.length === 0) {
      console.log(`⚠️  Prompt not found: "${title}"`);
      notFound++;
      continue;
    }

    const prompt = prompts[0];
    const finalUrl = ensureUrlParams(url);

    const { error } = await supabase
      .from('prompts')
      .update({ example_url: finalUrl })
      .eq('id', prompt.id);

    if (error) {
      console.error(`❌ Error updating "${title}":`, error.message);
      errors++;
    } else {
      console.log(`✅ Updated "${title}"`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Not found: ${notFound}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total processed: ${mappings.length}`);
}

updateFromJson().catch(console.error);



