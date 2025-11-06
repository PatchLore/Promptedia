#!/usr/bin/env node
/**
 * Rename files in Supabase bucket `audio_previews` to match prompt titles.
 * Desired pattern: `${title}_preview.mp3`
 *
 * Usage:
 *   node scripts/rename-audio-files.mjs --dry-run
 *   node scripts/rename-audio-files.mjs
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'audio_previews';
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function stripEmoji(str) {
  return (str || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
}

function normalizeTitle(title) {
  const cleaned = stripEmoji(title || '')
    .replace(/&/g, 'and')
    .replace(/[\s_]+/g, ' ')
    .trim();
  return cleaned;
}

function desiredFileNameFromTitle(title) {
  const t = normalizeTitle(title);
  return `${t}_preview.mp3`;
}

function normKey(str) {
  return decodeURIComponent((str || ''))
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

async function listAllFiles() {
  const all = [];
  // Supabase JS supports list with pagination via offset; we'll do simple single page up to 1000
  const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
  if (error) throw error;
  (data || []).forEach((f) => all.push(f));
  return all;
}

async function fetchPrompts() {
  const { data, error } = await supabase.from('prompts').select('id,title');
  if (error) throw error;
  return data || [];
}

async function copyThenRemove(oldName, newName) {
  // Supabase Storage has copy and remove; no direct rename
  const { error: copyErr } = await supabase.storage.from(BUCKET).copy(oldName, newName);
  if (copyErr) return { ok: false, error: copyErr };
  const { error: removeErr } = await supabase.storage.from(BUCKET).remove([oldName]);
  if (removeErr) return { ok: false, error: removeErr };
  return { ok: true };
}

async function main() {
  if (DRY_RUN) console.log('🧩 Dry-run mode ON (no storage writes)');

  const files = await listAllFiles();
  const prompts = await fetchPrompts();

  // Build map of best file matches lazily
  const fileIndex = files
    .filter((f) => f.name && f.name.toLowerCase().endsWith('_preview.mp3'))
    .map((f) => ({ name: f.name, key: normKey(f.name.replace(/_preview\.mp3$/i, '')) }));

  let renamed = 0;
  let skipped = 0;

  for (const p of prompts) {
    const desired = desiredFileNameFromTitle(p.title || '');
    const desiredKey = normKey(desired.replace(/_preview\.mp3$/i, ''));
    if (!desiredKey) continue;

    // Look for best match by exact normalized key
    let match = fileIndex.find((f) => f.key === desiredKey);

    // If no exact, try relaxed contains (handles minor spacing differences)
    if (!match) {
      match = fileIndex.find((f) => f.key.includes(desiredKey) || desiredKey.includes(f.key));
    }

    if (!match) {
      console.log(`⚠️ Skipped (no match) for prompt: "${p.title}"`);
      skipped++;
      continue;
    }

    // If already correct name, skip
    if (match.name === desired) {
      continue;
    }

    if (DRY_RUN) {
      console.log(`✅ (dry) Renamed "${match.name}" → "${desired}"`);
      renamed++;
    } else {
      const result = await copyThenRemove(match.name, desired);
      if (!result.ok) {
        console.log(`⚠️ Failed to rename "${match.name}" → "${desired}": ${result.error?.message || result.error}`);
        skipped++;
      } else {
        console.log(`✅ Renamed "${match.name}" → "${desired}"`);
        renamed++;
      }
    }
  }

  console.log('\n📊 Summary');
  console.log(`✅ ${renamed} files renamed${DRY_RUN ? ' (dry-run)' : ''}`);
  console.log(`⚠️ ${skipped} skipped (no match or error)`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});


