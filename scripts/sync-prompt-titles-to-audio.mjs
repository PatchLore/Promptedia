#!/usr/bin/env node
/**
 * Align prompt titles with Supabase audio preview filenames.
 *
 * Strategy:
 * 1) List files in bucket "audio_previews"
 * 2) For each file ending with "_preview.mp3" → baseName
 * 3) Find best-matching prompt by fuzzy token overlap
 * 4) Update prompt.title to exactly the filename base (decoded), unless --dry-run
 *
 * Usage:
 *   node scripts/sync-prompt-titles-to-audio.mjs [--dry-run]
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

function decodeBaseName(name) {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function toTitleFromFile(base) {
  // Convert e.g., "Deep%20House%20Flow" or "deep-house-flow" to "Deep House Flow"
  const decoded = decodeBaseName(base)
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Title case simple
  return decoded
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardSimilarity(a, b) {
  const setA = new Set(normalize(a).split(' ').filter(Boolean));
  const setB = new Set(normalize(b).split(' ').filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return inter / union;
}

async function listAllFiles() {
  // List up to 1000 files at root of bucket
  const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
  if (error) throw error;
  return data || [];
}

async function fetchAllPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('id,title')
    .limit(2000);
  if (error) throw error;
  return data || [];
}

async function main() {
  if (DRY_RUN) console.log('🧩 Dry-run mode ON (no database writes)');

  const files = await listAllFiles();
  const prompts = await fetchAllPrompts();

  let renamed = 0;
  let skipped = 0;

  // Precompute normalized titles for prompts
  const promptNorm = prompts.map((p) => ({ ...p, norm: normalize(p.title) }));

  for (const f of files) {
    if (!f.name || !f.name.toLowerCase().endsWith('_preview.mp3')) continue;
    const base = f.name.slice(0, -'_preview.mp3'.length);
    const candidateTitle = toTitleFromFile(base);
    const normCandidate = normalize(candidateTitle);

    // Find best match by similarity
    let best = null;
    let bestScore = 0;
    for (const p of promptNorm) {
      const score = jaccardSimilarity(p.norm, normCandidate);
      if (score > bestScore) {
        best = p;
        bestScore = score;
      }
    }

    // Accept only decent matches
    if (best && bestScore >= 0.5 && best.title !== candidateTitle) {
      if (DRY_RUN) {
        console.log(`✅ (dry) Renamed "${best.title}" → "${candidateTitle}"`);
        renamed++;
      } else {
        const { error } = await supabase
          .from('prompts')
          .update({ title: candidateTitle })
          .eq('id', best.id);
        if (error) {
          console.log(`⚠️ Failed to rename "${best.title}": ${error.message}`);
          skipped++;
        } else {
          console.log(`✅ Renamed "${best.title}" → "${candidateTitle}"`);
          renamed++;
        }
      }
    } else {
      console.log(`⚠️ Skipped "${decodeBaseName(base)}" (no prompt match)`);
      skipped++;
    }
  }

  console.log('\n📊 Summary');
  console.log(`✅ ${renamed} prompts renamed`);
  console.log(`⚠️ ${skipped} skipped (no match or low similarity)`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});


