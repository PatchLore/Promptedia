// Script to update example_url values in Supabase prompts table
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCurrentPrompts() {
  console.log('📋 Current prompts in database:\n');
  
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, title, category, example_url, type')
    .eq('is_public', true)
    .order('title');

  if (error) {
    console.error('Error fetching prompts:', error);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.log('No prompts found.');
    return;
  }

  prompts.forEach((prompt, index) => {
    console.log(`${index + 1}. ${prompt.title} (${prompt.category}, ${prompt.type || 'unknown'})`);
    console.log(`   ID: ${prompt.id}`);
    console.log(`   Current URL: ${prompt.example_url || '(none)'}`);
    console.log('');
  });

  return prompts;
}

function ensureUrlParams(url) {
  if (!url) return url;
  
  // If URL already has query params, merge them
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
    console.log('Create update-images.json with your URL mappings.');
    return;
  }

  const urlMap = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Handle both formats: object map or array of updates
  let mappings = [];
  if (Array.isArray(urlMap.updates)) {
    // Format: { "updates": [{ "title": "...", "url": "..." }] }
    mappings = urlMap.updates.map(u => ({ title: u.title, url: u.url }));
  } else {
    // Format: { "Title": "url", ... }
    mappings = Object.entries(urlMap).map(([title, url]) => ({ title, url }));
  }

  if (mappings.length === 0) {
    console.log('No updates found in config file.');
    return;
  }

  console.log(`🔄 Updating ${mappings.length} prompts...\n`);

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
    const { data: prompts } = await supabase
      .from('prompts')
      .select('id, title')
      .eq('title', title)
      .limit(1);

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
      console.log(`   ${finalUrl}`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Not found: ${notFound}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total processed: ${mappings.length}`);
}

async function updateAllImagePrompts() {
  console.log('🔄 Updating all image prompts with Unsplash URLs...\n');

  // Get all prompts
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, category, type')
    .eq('is_public', true)
    .order('title');

  if (fetchError) {
    console.error('Error fetching prompts:', fetchError);
    return;
  }

  // Filter to only image prompts (or prompts without type set)
  const imagePrompts = prompts.filter(p => !p.type || p.type === 'image');

  console.log(`Found ${imagePrompts.length} image prompts to update.\n`);

  // Read the JSON config
  const jsonPath = path.join(__dirname, 'update-images.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Config file not found: ${jsonPath}`);
    console.log('Please create update-images.json with your Unsplash URLs.');
    return;
  }

  const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const urlMap = {};
  (config.updates || []).forEach(update => {
    urlMap[update.title] = update.url;
  });

  let updated = 0;
  let notFound = 0;

  for (const prompt of imagePrompts) {
    const url = urlMap[prompt.title];
    
    if (!url) {
      console.log(`⚠️  No URL found for: "${prompt.title}"`);
      notFound++;
      continue;
    }

    const finalUrl = ensureUrlParams(url);

    const { error } = await supabase
      .from('prompts')
      .update({ example_url: finalUrl })
      .eq('id', prompt.id);

    if (error) {
      console.error(`❌ Error updating "${prompt.title}":`, error.message);
    } else {
      console.log(`✅ Updated "${prompt.title}"`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Not found: ${notFound}`);
  console.log(`   📝 Total: ${imagePrompts.length}`);
}

// Run the update
if (require.main === module) {
  const command = process.argv[2] || 'update';
  
  if (command === 'list') {
    listCurrentPrompts();
  } else if (command === 'update') {
    updateFromJson();
  } else if (command === 'update-all') {
    updateAllImagePrompts();
  } else {
    console.log('Usage:');
    console.log('  node scripts/update-example-urls.js list        - List current prompts');
    console.log('  node scripts/update-example-urls.js update      - Update from update-images.json');
    console.log('  node scripts/update-example-urls.js update-all  - Update all image prompts');
  }
}

module.exports = { listCurrentPrompts, updateFromJson, updateAllImagePrompts };