#!/usr/bin/env node
/**
 * Backfill null fields in prompts:
 * - model → "Leonardo.Ai"
 * - user_id → first profile id (if available) else "system-admin"
 * - audio_preview_url → try to link file in bucket audio_previews by slug or id
 *
 * Usage: node scripts/fix-null-prompts.mjs
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const BUCKET = 'audio_previews';
const DEFAULT_MODEL = 'Leonardo.Ai';
const ENV_SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || process.env.NEXT_PUBLIC_SYSTEM_USER_ID;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isUuid(value) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    String(value || '')
  );
}

async function getSystemUserId() {
  // Prefer explicit env var if provided and valid
  if (ENV_SYSTEM_USER_ID && isUuid(ENV_SYSTEM_USER_ID)) {
    return ENV_SYSTEM_USER_ID;
  }

  // Try fetch first profile id as system owner
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    if (!error && data?.id && isUuid(data.id)) return data.id;
  } catch {}

  return null; // no valid UUID available
}

async function fileExists(fileName) {
  // List with prefix to check existence
  const prefix = fileName;
  const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 1, search: prefix });
  if (error) return false;
  if (data && data.length > 0) {
    return data.find((f) => f.name.toLowerCase() === fileName.toLowerCase()) != null;
  }
  return false;
}

function publicUrlFor(name) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return data?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
}

async function tryFindPreviewForPrompt(prompt) {
  // Try by id
  const idCandidate = `${prompt.id}_preview.mp3`;
  if (await fileExists(idCandidate)) return publicUrlFor(idCandidate);

  // Try by title slug
  const slug = slugify(prompt.title || '');
  if (slug) {
    const slugCandidate = `${slug}_preview.mp3`;
    if (await fileExists(slugCandidate)) return publicUrlFor(slugCandidate);
  }

  // Try by simplified title (spaces to dash already handled by slug)
  return null;
}

async function main() {
  console.log('🔧 Fixing null fields in prompts...');
  if (DRY_RUN) {
    console.log('🧩 Dry-run mode ON (no database writes)');
  }

  const systemUserId = await getSystemUserId();

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id,title,model,user_id,audio_preview_url')
    .or('model.is.null,user_id.is.null,audio_preview_url.is.null');

  if (error) {
    console.error('❌ Query error:', error.message);
    process.exit(1);
  }

  if (!prompts || prompts.length === 0) {
    console.log('✅ No prompts with null fields.');
    return;
  }

  let updatedModel = 0;
  let updatedUser = 0;
  let linkedPreviews = 0;
  let skippedPreview = 0;
  let simulatedChanges = 0;
  let skippedUser = 0;

  for (const p of prompts) {
    const update = {};
    if (!p.model) {
      update.model = DEFAULT_MODEL;
    }
    if (!p.user_id) {
      if (systemUserId && isUuid(systemUserId)) {
        update.user_id = systemUserId;
      } else {
        skippedUser++;
      }
    }
    if (!p.audio_preview_url) {
      const preview = await tryFindPreviewForPrompt(p);
      if (preview) {
        update.audio_preview_url = preview;
      }
    }

    if (Object.keys(update).length > 0) {
      if (DRY_RUN) {
        simulatedChanges++;
        const before = {
          model: p.model || null,
          user_id: p.user_id || null,
          audio_preview_url: p.audio_preview_url || null,
        };
        const after = {
          model: update.model ?? before.model,
          user_id: update.user_id ?? before.user_id,
          audio_preview_url: update.audio_preview_url ?? before.audio_preview_url,
        };
        console.log(
          `🧩 Prompt ${JSON.stringify(p.title || p.id)} → would set model="${after.model}"` +
            `${after.user_id !== before.user_id ? `, user_id="${after.user_id}"` : ''}` +
            `${after.audio_preview_url && after.audio_preview_url !== before.audio_preview_url ? `, audio_preview_url="${after.audio_preview_url}"` : ''}`
        );
      } else {
        const { error: upErr } = await supabase
          .from('prompts')
          .update(update)
          .eq('id', p.id);
        if (upErr) {
          console.error(`❌ Update failed for ${p.id}:`, upErr.message);
        } else {
          if (update.model) updatedModel++;
          if (update.user_id) updatedUser++;
          if (update.audio_preview_url) linkedPreviews++;
          else if (!p.audio_preview_url) skippedPreview++;
          console.log(`✅ Updated ${p.id} ${p.title ? `(${p.title})` : ''}`);
        }
      }
    } else if (!p.audio_preview_url) {
      skippedPreview++;
    }
  }

  console.log('\n📊 Summary');
  console.log(`✅ Updated ${updatedModel} prompts (model)`);
  console.log(`✅ Updated ${updatedUser} prompts (user_id)`);
  console.log(`✅ Linked ${linkedPreviews} previews`);
  if (skippedPreview > 0) console.log(`⚠️ Skipped ${skippedPreview} (no match)`);
  if (DRY_RUN) console.log(`🧩 ${simulatedChanges} simulated changes (dry-run)`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});


