/**
 * fix_prompt_media_urls.js — Update prompt thumbnail_url and audio_preview_url with Supabase Storage URLs
 * 
 * Replaces placeholder thumbnails with real Supabase storage image URLs
 * and links existing AI audio previews for music prompts.
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

// Category to default image mapping (matches SQL migration)
const DEFAULT_IMAGES_BY_CATEGORY = {
  Art: `${STORAGE_BASE_URL}/art_images/art/Cyberpunk%20Skyline.jpeg`,
  Music: `${STORAGE_BASE_URL}/art_images/art/Ethereal%20Wings.jpeg`,
  Writing: `${STORAGE_BASE_URL}/art_images/art/Astral%20Garden.jpeg`,
  Coding: `${STORAGE_BASE_URL}/art_images/art/Glass%20Ocean.jpg`,
  Business: `${STORAGE_BASE_URL}/art_images/art/Golden%20Hour%20Street.jpeg`,
};

// Default audio preview for music prompts
const DEFAULT_MUSIC_AUDIO = `${STORAGE_BASE_URL}/art_images/music_previews/preview_ambient_demo.mp3`;

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
 * Get files from Supabase Storage bucket
 */
async function listStorageFiles(bucketId, folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`❌ Error listing ${bucketId}:`, error.message);
      return [];
    }

    return (data || [])
      .filter(file => !file.name.startsWith('.'))
      .map(file => ({
        name: file.name,
        path: folder ? `${folder}/${file.name}` : file.name,
        publicUrl: `${STORAGE_BASE_URL}/${bucketId}/${folder ? `${folder}/` : ''}${encodeURIComponent(file.name)}`,
      }));
  } catch (err) {
    console.error(`❌ Error accessing bucket ${bucketId}:`, err.message);
    return [];
  }
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
 * Update prompt media URLs
 */
async function updatePromptMediaUrls() {
  console.log('🔍 Fetching prompts with missing media URLs...\n');

  // Get all prompts
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, category, thumbnail_url, audio_preview_url');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.log('ℹ️  No prompts found.');
    return;
  }

  console.log(`✅ Found ${prompts.length} prompts\n`);

  // Get available files from storage (if buckets exist)
  console.log('📋 Listing files from Supabase Storage...\n');
  let artFiles = [];
  let musicAudioFiles = [];
  
  try {
    artFiles = await listStorageFiles('art_images', 'art');
    musicAudioFiles = await listStorageFiles('art_images', 'music_previews');
    console.log(`  ✅ Found ${artFiles.length} art images`);
    console.log(`  ✅ Found ${musicAudioFiles.length} music audio files\n`);
  } catch (err) {
    console.log(`  ⚠️  Could not list storage files (buckets may not exist yet)`);
    console.log(`  ℹ️  Will use default category-based URLs instead\n`);
  }

  let thumbnailsUpdated = 0;
  let audioUpdated = 0;
  let skipped = 0;
  let errors = 0;

  console.log('🔄 Updating prompt media URLs...\n');

  for (const prompt of prompts) {
    const category = (prompt.category || '').trim();
    const needsThumbnail = !prompt.thumbnail_url || 
                           prompt.thumbnail_url.includes('placeholder.svg') ||
                           prompt.thumbnail_url.includes('/images/placeholder');
    const needsAudio = category === 'Music' && !prompt.audio_preview_url;

    let updateFields = {};

    // Update thumbnail_url
    if (needsThumbnail) {
      // Try to match by title if files are available
      let matchedFile = artFiles.length > 0 ? matchFile(prompt.title, artFiles) : null;
      
      if (matchedFile) {
        updateFields.thumbnail_url = matchedFile.publicUrl;
      } else if (DEFAULT_IMAGES_BY_CATEGORY[category]) {
        // Use category default
        updateFields.thumbnail_url = DEFAULT_IMAGES_BY_CATEGORY[category];
      }
    }

    // Update audio_preview_url for Music prompts
    if (needsAudio) {
      // Try to match audio file by title if files are available
      let matchedAudio = musicAudioFiles.length > 0 ? matchFile(prompt.title, musicAudioFiles) : null;
      
      if (matchedAudio) {
        updateFields.audio_preview_url = matchedAudio.publicUrl;
      } else {
        // Use default audio URL
        updateFields.audio_preview_url = DEFAULT_MUSIC_AUDIO;
      }
    }

    // Only update if we have changes
    if (Object.keys(updateFields).length === 0) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('prompts')
      .update(updateFields)
      .eq('id', prompt.id);

    if (updateError) {
      console.error(`❌ Error updating "${prompt.title}":`, updateError.message);
      errors++;
    } else {
      if (updateFields.thumbnail_url) {
        console.log(`✅ Updated thumbnail: ${prompt.title}`);
        thumbnailsUpdated++;
      }
      if (updateFields.audio_preview_url) {
        console.log(`✅ Updated audio: ${prompt.title}`);
        audioUpdated++;
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Thumbnails updated: ${thumbnailsUpdated}`);
  console.log(`✅ Audio previews updated: ${audioUpdated}`);
  console.log(`⏭️  Skipped (already correct): ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n🎉 Update complete!`);
}

updatePromptMediaUrls()
  .then(() => {
    console.log('\n✅ Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });

