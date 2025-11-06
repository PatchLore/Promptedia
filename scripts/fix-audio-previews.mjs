#!/usr/bin/env node
/**
 * Link existing audio preview files in Supabase Storage to prompts with null audio_preview_url.
 *
 * Usage:
 *   node scripts/fix-audio-previews.mjs --dry-run   # preview only
 *   node scripts/fix-audio-previews.mjs             # apply updates
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

function normalizeHuman(title) {
  return stripEmoji(title || '')
    .replace(/&/g, 'and')
    .replace(/[\s_]+/g, ' ')
    .trim();
}

function desiredFileNameFromTitle(title) {
  const t = normalizeHuman(title);
  return `${t}_preview.mp3`;
}

function normKey(str) {
  return decodeURIComponent((str || ''))
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function distance(a, b) {
  // Levenshtein distance (iterative DP)
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  // Convert distance to a similarity score [0..1]
  const A = normKey(a);
  const B = normKey(b);
  if (!A && !B) return 1;
  if (!A || !B) return 0;
  const maxLen = Math.max(A.length, B.length);
  const d = distance(A, B);
  return 1 - d / maxLen;
}

function publicUrlFor(name) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return data?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
}

async function main() {
  if (DRY_RUN) console.log('🧩 Dry-run mode ON (no database writes)');

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id,title,category,type,audio_preview_url')
    .is('audio_preview_url', null);
  if (error) {
    console.error('❌ Query error:', error.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('✅ No prompts with null audio_preview_url');
    return;
  }

  // Build a filename index once
  const { data: fileList, error: listErr } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
  if (listErr) {
    console.error('❌ Storage list error:', listErr.message);
    process.exit(1);
  }
  const audioFiles = (fileList || []).filter((f) => (f.name || '').toLowerCase().endsWith('_preview.mp3'));

  let updated = 0;
  let skipped = 0;
  let ignored = 0;

  for (const p of prompts) {
    // Ignore non-audio prompts (by category or type if available)
    const kind = `${(p.category || '').toLowerCase()} ${(p.type || '').toLowerCase()}`;
    if (!kind.includes('music') && !kind.includes('audio')) {
      ignored++;
      continue;
    }

    const desiredName = desiredFileNameFromTitle(p.title || '');
    const desiredKey = normKey(desiredName.replace(/_preview\.mp3$/i, ''));

    // Compute best match among files by similarity of normalized base
    let best = null;
    let bestScore = 0;
    for (const f of audioFiles) {
      const base = f.name.replace(/_preview\.mp3$/i, '');
      const score = similarity(base, desiredName.replace(/_preview\.mp3$/i, ''));
      if (score > bestScore) {
        best = f;
        bestScore = score;
      }
    }

    // Accept if reasonably close
    if (!best || bestScore < 0.6) {
      console.log(`⚠️ Skipped ${JSON.stringify(p.title || p.id)} (no close match)`);
      skipped++;
      continue;
    }

    const targetFile = best.name; // keep exact stored filename
    const url = publicUrlFor(targetFile);

    if (DRY_RUN) {
      console.log(`🎧 Matched ${JSON.stringify(p.title || p.id)} ↔ ${JSON.stringify(targetFile)}`);
      console.log(`   Would update audio_preview_url → ${url}`);
      updated++;
    } else {
      const { error: upErr } = await supabase
        .from('prompts')
        .update({ audio_preview_url: url })
        .eq('id', p.id);
      if (upErr) {
        console.log(`⚠️ Failed to update ${JSON.stringify(p.title || p.id)}: ${upErr.message}`);
        skipped++;
      } else {
        console.log(`🎧 Matched ${JSON.stringify(p.title || p.id)} ↔ ${JSON.stringify(targetFile)}`);
        console.log(`✅ Updated audio_preview_url → ${url}`);
        updated++;
      }
    }
  }

  console.log('\n📊 Summary');
  console.log(`✅ ${updated} prompts ${DRY_RUN ? 'would be ' : ''}updated`);
  console.log(`⚠️ ${skipped} skipped (no close match or error)`);
  console.log(`💤 ${ignored} ignored (non-audio prompts)`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});


