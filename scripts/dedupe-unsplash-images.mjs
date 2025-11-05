#!/usr/bin/env node
// Deduplicate Unsplash images across prompts by replacing duplicates with unique results

import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function extractUnsplashId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // common pattern: /photo-<id>
    const m = u.pathname.match(/photo-([A-Za-z0-9_-]+)/);
    if (m) return m[1];
    // fallback: sometimes /photos/<id>/...
    const m2 = u.pathname.match(/\/photos\/([A-Za-z0-9_-]+)/);
    if (m2) return m2[1];
  } catch {}
  return null;
}

async function searchUniqueImage({ title, category, avoidIds, tries = 4 }) {
  const perPage = 30;
  for (let attempt = 0; attempt < tries; attempt++) {
    const page = Math.floor(Math.random() * 10) + 1;
    const params = new URLSearchParams({
      query: `${title || ''} ${category || ''}`.trim() || category || 'abstract',
      orientation: 'landscape',
      per_page: String(perPage),
      page: String(page),
      client_id: UNSPLASH_ACCESS_KEY,
    });
    const res = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`);
    if (!res.ok) continue;
    const data = await res.json();
    const results = data.results || [];
    const candidate = results.find((p) => !avoidIds.has(p.id));
    if (candidate) {
      return `${candidate.urls.raw}?w=1280&h=720&fit=crop&q=80`;
    }
  }
  return null;
}

async function main() {
  console.log('Fetching prompts...');
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id,title,category,example_url')
    .eq('is_public', true);
  if (error) throw error;

  const idToPrompts = new Map();
  const usedIds = new Set();
  for (const p of prompts) {
    const id = extractUnsplashId(p.example_url);
    if (id) {
      usedIds.add(id);
      if (!idToPrompts.has(id)) idToPrompts.set(id, []);
      idToPrompts.get(id).push(p);
    }
  }

  // Find duplicates (keep the first, replace others)
  const dupGroups = Array.from(idToPrompts.entries()).filter(([, arr]) => arr.length > 1);
  if (dupGroups.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  console.log(`Found ${dupGroups.length} duplicate image groups. Fixing...`);
  for (const [unsplashId, arr] of dupGroups) {
    // keep first
    const keep = arr[0];
    const toReplace = arr.slice(1);
    for (const p of toReplace) {
      const newUrl = await searchUniqueImage({
        title: p.title,
        category: p.category,
        avoidIds: usedIds,
      });
      if (!newUrl) {
        console.warn(`Could not find unique image for prompt ${p.id}`);
        continue;
      }
      const newId = extractUnsplashId(newUrl);
      if (newId) usedIds.add(newId);
      const { error: upErr } = await supabase
        .from('prompts')
        .update({ example_url: newUrl })
        .eq('id', p.id);
      if (upErr) {
        console.error(`Failed to update ${p.id}:`, upErr.message);
      } else {
        console.log(`Updated ${p.id} with new image ${newId}`);
      }
      // be gentle
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log('De-duplication complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


