#!/usr/bin/env node
/**
 * Upload art images from local folder to Supabase Storage and update prompt example_url.
 *
 * Usage:
 *   node scripts/upload-art-images.mjs [--dry-run]
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - art/ folder with images named matching prompt titles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ART_DIR = path.join(__dirname, '..', 'art');
const BUCKET = 'art_images';
const DRY_RUN = process.argv.includes('--dry-run');

function normalizeTitle(title) {
  return (title || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeFilename(filename) {
  // Remove extension and normalize
  const basename = path.basename(filename, path.extname(filename));
  return normalizeTitle(basename);
}

async function ensureBucket(supabase) {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET);
    if (error && error.message && error.message.includes('not found')) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
      if (createErr) {
        console.error('❌ Failed to create bucket:', createErr.message);
        process.exit(1);
      }
      console.log(`🪣 Created bucket: ${BUCKET}`);
    } else if (error) {
      console.error('❌ Error checking bucket:', error.message);
      process.exit(1);
    } else {
      console.log(`✅ Bucket exists: ${BUCKET}`);
    }
  } catch (e) {
    console.error('❌ Error ensuring bucket:', e.message);
    process.exit(1);
  }
}

async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (DRY_RUN) {
    console.log('🧩 Dry-run mode ON (no uploads or database writes)\n');
  }

  // Ensure bucket exists
  await ensureBucket(supabase);

  // Check if art directory exists
  if (!fs.existsSync(ART_DIR)) {
    console.error(`❌ Art directory not found: ${ART_DIR}`);
    process.exit(1);
  }

  // Read all files from art directory
  const files = fs.readdirSync(ART_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  if (files.length === 0) {
    console.error(`❌ No image files found in ${ART_DIR}`);
    process.exit(1);
  }

  console.log(`📁 Found ${files.length} image files\n`);

  // Fetch all art prompts from database
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, example_url, category')
    .eq('category', 'Art')
    .eq('is_public', true);

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.error('❌ No art prompts found in database');
    process.exit(1);
  }

  console.log(`📊 Found ${prompts.length} art prompts in database\n`);

  // Create a map of normalized titles to prompts
  const promptMap = new Map();
  prompts.forEach((prompt) => {
    const normalized = normalizeTitle(prompt.title);
    if (!promptMap.has(normalized)) {
      promptMap.set(normalized, []);
    }
    promptMap.get(normalized).push(prompt);
  });

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  // Process each image file
  for (const filename of files) {
    const filePath = path.join(ART_DIR, filename);
    const normalizedFilename = normalizeFilename(filename);
    
    // Find matching prompt(s)
    const matchingPrompts = promptMap.get(normalizedFilename);

    if (!matchingPrompts || matchingPrompts.length === 0) {
      console.log(`⚠️  No matching prompt found for: ${filename} (normalized: "${normalizedFilename}")`);
      notFound++;
      continue;
    }

    // Use first match if multiple
    const prompt = matchingPrompts[0];
    if (matchingPrompts.length > 1) {
      console.log(`⚠️  Multiple prompts match "${filename}", using first: "${prompt.title}"`);
    }

    const storagePath = `art/${filename}`;

    if (DRY_RUN) {
      console.log(`🧩 Would upload: ${filename}`);
      console.log(`   → Storage: ${storagePath}`);
      console.log(`   → Prompt: "${prompt.title}" (${prompt.id})`);
      console.log(`   → Current URL: ${prompt.example_url || '(none)'}\n`);
      uploaded++;
      updated++;
      continue;
    }

    try {
      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileStats = fs.statSync(filePath);
      
      console.log(`📤 Uploading: ${filename} (${(fileStats.size / 1024).toFixed(1)}KB)`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: `image/${path.extname(filename).slice(1).toLowerCase() === 'jpg' ? 'jpeg' : path.extname(filename).slice(1).toLowerCase()}`,
          upsert: true, // Overwrite if exists
        });

      if (uploadError) {
        console.error(`   ❌ Upload failed: ${uploadError.message}`);
        skipped++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      console.log(`   ✅ Uploaded: ${publicUrl}`);

      // Update prompt in database
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ example_url: publicUrl })
        .eq('id', prompt.id);

      if (updateError) {
        console.error(`   ❌ Database update failed: ${updateError.message}`);
        skipped++;
        continue;
      }

      console.log(`   ✅ Updated prompt: "${prompt.title}"\n`);
      uploaded++;
      updated++;
    } catch (error) {
      console.error(`   ❌ Error processing ${filename}:`, error.message);
      skipped++;
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ✅ Updated: ${updated}`);
  if (skipped > 0) console.log(`   ⚠️  Skipped: ${skipped}`);
  if (notFound > 0) console.log(`   ⚠️  Not found: ${notFound}`);
  if (DRY_RUN) console.log(`   🧩 Dry-run mode (no actual changes)`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});

