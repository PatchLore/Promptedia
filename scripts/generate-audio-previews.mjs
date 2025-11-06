#!/usr/bin/env node
/**
 * Generate 25s MP3 previews from full-length audio files and upload to Supabase Storage.
 *
 * Usage:
 *   node scripts/generate-audio-previews.mjs [inputDir] [--length 25] [--start 0]
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - npm i -D dotenv
 *   - npm i fluent-ffmpeg ffmpeg-static @supabase/supabase-js
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

dotenv.config({ path: '.env.local' });

const INPUT_DIR = process.argv[2] || 'audio';
const LENGTH_SEC = parseInt(getArg('--length', '25'), 10);
const START_SEC = parseInt(getArg('--start', '0'), 10);
const BUCKET = 'audio_previews';

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function isAudioFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'].includes(ext);
}

function toPreviewName(basename) {
  return `${basename}_preview.mp3`;
}

function slugify(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureBucket(supabase) {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET);
    if (error && error.message && error.message.includes('not found')) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024,
      });
      if (createErr) {
        console.error('❌ Failed to create bucket:', createErr.message);
        process.exit(1);
      }
      console.log(`🪣 Created bucket: ${BUCKET}`);
    } else if (error) {
      // Some SDKs return error=null when bucket exists
      // We'll ignore unknown errors here
    }
  } catch (e) {
    // Ignore; bucket likely exists
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

  await ensureBucket(supabase);

  ffmpeg.setFfmpegPath(ffmpegStatic);

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter(isAudioFile);
  if (files.length === 0) {
    console.log('ℹ️ No audio files found.');
    return;
  }

  console.log(`🎧 Processing ${files.length} file(s) from ${INPUT_DIR} ...`);

  let uploaded = 0;
  let updated = 0;
  let failed = 0;

  for (const file of files) {
    const srcPath = path.join(INPUT_DIR, file);
    const base = path.parse(file).name; // without extension
    const previewName = toPreviewName(base);
    const tmpOut = path.join('.next', previewName); // temp file path

    try {
      await transcodeToPreview(srcPath, tmpOut, START_SEC, LENGTH_SEC);

      const fileBuffer = fs.readFileSync(tmpOut);
      const { data: up, error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(previewName, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(previewName);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Failed to get public URL');

      const matched = await updatePromptPreviewUrl(supabase, base, publicUrl);
      if (matched) updated++;

      uploaded++;
      console.log(`✅ ${file} → ${previewName} (${publicUrl})`);
    } catch (e) {
      console.error(`❌ Failed for ${file}:`, e.message || e);
      failed++;
    } finally {
      try { fs.existsSync(tmpOut) && fs.unlinkSync(tmpOut); } catch {}
    }
  }

  console.log('\n📊 Summary');
  console.log(`   Uploaded previews: ${uploaded}`);
  console.log(`   Prompts updated:   ${updated}`);
  console.log(`   Failed:            ${failed}`);
}

function transcodeToPreview(input, output, startSec, lengthSec) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(startSec)
      .duration(lengthSec)
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .format('mp3')
      .on('error', (err) => reject(err))
      .on('end', () => resolve())
      .save(output);
  });
}

async function updatePromptPreviewUrl(supabase, baseName, url) {
  // Strategy:
  // 1) Try match by prompt.id == baseName (UUID)
  // 2) Try match by prompt.title slug == baseName

  // Try ID match
  if (/^[0-9a-fA-F-]{36}$/.test(baseName)) {
    const { data, error } = await supabase
      .from('prompts')
      .update({ audio_preview_url: url })
      .eq('id', baseName)
      .select('id')
      .maybeSingle();
    if (!error && data) return true;
  }

  // Try title slug match (case-insensitive)
  const { data: byTitle } = await supabase
    .from('prompts')
    .select('id,title')
    .ilike('title', baseName.replace(/[-_]+/g, ' '));

  if (byTitle && byTitle.length > 0) {
    const promptId = byTitle[0].id;
    const { error } = await supabase
      .from('prompts')
      .update({ audio_preview_url: url })
      .eq('id', promptId);
    if (!error) return true;
  }

  return false;
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});


