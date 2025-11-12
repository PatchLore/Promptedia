/**
 * fix_art_music_images.js — Update prompt records with art_url and thumbnail_url from Supabase Storage
 * 
 * Matches prompts by category or title and sets:
 * - Art prompts → art_url and thumbnail_url from art-previews bucket
 * - Music prompts → art_url from music-previews bucket
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

/**
 * Get all files from a storage bucket
 */
async function listBucketFiles(bucketId) {
  console.log(`📋 Listing files in bucket: ${bucketId}...`);
  
  const { data, error } = await supabase.storage
    .from(bucketId)
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    console.error(`❌ Error listing ${bucketId}:`, error.message);
    return [];
  }

  const files = (data || [])
    .filter(file => !file.name.startsWith('.'))
    .map(file => ({
      name: file.name,
      publicUrl: `${STORAGE_BASE_URL}/${bucketId}/${file.name}`,
    }));

  console.log(`  ✅ Found ${files.length} files`);
  return files;
}

/**
 * Normalize title for matching (lowercase, remove special chars)
 */
function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try to match a prompt title with a file name
 */
function matchFile(promptTitle, files) {
  const normalizedTitle = normalizeTitle(promptTitle);
  
  // Try exact match first
  for (const file of files) {
    const normalizedFile = normalizeTitle(file.name);
    if (normalizedFile.includes(normalizedTitle) || normalizedTitle.includes(normalizedFile)) {
      return file;
    }
  }

  // Try partial match (words)
  const titleWords = normalizedTitle.split(/\s+/).filter(w => w.length > 3);
  for (const file of files) {
    const normalizedFile = normalizeTitle(file.name);
    const matchCount = titleWords.filter(word => normalizedFile.includes(word)).length;
    if (matchCount >= Math.min(2, titleWords.length)) {
      return file;
    }
  }

  return null;
}

/**
 * Update prompts with art/music URLs
 */
async function updatePrompts() {
  console.log('🔍 Fetching all prompts...\n');

  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, category, art_url, thumbnail_url');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    return;
  }

  console.log(`✅ Found ${prompts.length} prompts\n`);

  // Get files from storage buckets
  const artFiles = await listBucketFiles('art-previews');
  const musicFiles = await listBucketFiles('music-previews');

  if (artFiles.length === 0 && musicFiles.length === 0) {
    console.log('⚠️  No files found in storage buckets. Run upload script first.');
    return;
  }

  console.log('\n🔄 Matching prompts with files...\n');

  let artUpdated = 0;
  let musicUpdated = 0;
  let skipped = 0;
  let notMatched = [];

  for (const prompt of prompts) {
    const category = (prompt.category || '').toLowerCase();
    const isArt = category.includes('art') || category === 'art';
    const isMusic = category.includes('music') || category === 'music';

    let matchedFile = null;
    let updateFields = {};

    if (isArt && artFiles.length > 0) {
      matchedFile = matchFile(prompt.title, artFiles);
      if (matchedFile) {
        updateFields = {
          art_url: matchedFile.publicUrl,
          thumbnail_url: matchedFile.publicUrl, // Also set thumbnail for Art prompts
        };
      }
    } else if (isMusic && musicFiles.length > 0) {
      matchedFile = matchFile(prompt.title, musicFiles);
      if (matchedFile) {
        updateFields = {
          art_url: matchedFile.publicUrl,
        };
      }
    }

    if (Object.keys(updateFields).length > 0) {
      // Check if update is needed
      const needsUpdate = 
        (updateFields.art_url && prompt.art_url !== updateFields.art_url) ||
        (updateFields.thumbnail_url && prompt.thumbnail_url !== updateFields.thumbnail_url);

      if (!needsUpdate) {
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('prompts')
        .update(updateFields)
        .eq('id', prompt.id);

      if (updateError) {
        console.error(`❌ Error updating "${prompt.title}":`, updateError.message);
      } else {
        if (isArt) artUpdated++;
        if (isMusic) musicUpdated++;
        console.log(`✅ Updated: ${prompt.title} (${isArt ? 'Art' : 'Music'})`);
        console.log(`   → ${matchedFile.publicUrl}`);
      }
    } else {
      if (isArt || isMusic) {
        notMatched.push(prompt.title);
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Art prompts updated: ${artUpdated}`);
  console.log(`✅ Music prompts updated: ${musicUpdated}`);
  console.log(`⏭️  Skipped (already correct): ${skipped}`);
  console.log(`❓ Not matched: ${notMatched.length}`);

  if (notMatched.length > 0) {
    console.log(`\n⚠️  Prompts without matching files:`);
    notMatched.slice(0, 10).forEach(title => console.log(`   - ${title}`));
    if (notMatched.length > 10) {
      console.log(`   ... and ${notMatched.length - 10} more`);
    }
  }

  console.log(`\n🎉 Update complete!`);
}

updatePrompts()
  .then(() => {
    console.log('\n✅ Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });

