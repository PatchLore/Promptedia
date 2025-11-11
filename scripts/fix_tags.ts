import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type PromptRecord = Database['public']['Tables']['prompts']['Row'];
type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

const PAGE_SIZE = 1000;
const BATCH_SIZE = 100;

function getSupabaseClient(): SupabaseClient<Database> {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_PROJECT_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or fallback) environment variable.');
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

function normalizeTags(tags: PromptRecord['tags']): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const value = tag.trim().toLowerCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

function hasTagChanges(original: PromptRecord['tags'], normalized: string[]): boolean {
  if (!Array.isArray(original)) {
    return normalized.length > 0;
  }

  if (original.length !== normalized.length) {
    return true;
  }

  return original.some((tag, index) => {
    if (typeof tag !== 'string') {
      return true;
    }
    return tag.trim().toLowerCase() !== normalized[index];
  });
}

async function fetchAllPrompts(client: SupabaseClient<Database>): Promise<PromptRecord[]> {
  const results: PromptRecord[] = [];
  let from = 0;

  for (;;) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await client
      .from('prompts')
      .select('id, tags', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    results.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return results;
}

export async function runFixTags(): Promise<void> {
  const supabase = getSupabaseClient();
  console.log('🔄 Fetching prompts from Supabase…');
  const prompts = await fetchAllPrompts(supabase);
  console.log(`📄 Retrieved ${prompts.length} prompts. Processing…`);

  const updates: PromptUpdate[] = [];

  for (const prompt of prompts) {
    const normalized = normalizeTags(prompt.tags);
    if (!prompt.id) {
      continue;
    }

    if (hasTagChanges(prompt.tags, normalized)) {
      updates.push({
        id: prompt.id,
        tags: normalized,
      });
    }
  }

  if (updates.length === 0) {
    console.log('✨ No tag updates required. All prompts already normalized.');
    return;
  }

  console.log(`✏️ Preparing to update ${updates.length} prompts in batches of ${BATCH_SIZE}…`);

  const promptTable = supabase.from('prompts') as any;

  for (let index = 0; index < updates.length; index += BATCH_SIZE) {
    const batch = updates.slice(index, index + BATCH_SIZE);
    const { error } = await promptTable.upsert(batch, {
      onConflict: 'id',
    });
    if (error) {
      throw new Error(`Failed to upsert batch starting at index ${index}: ${error.message}`);
    }
    console.log(
      `✅ Updated tags for prompts ${index + 1}-${Math.min(index + batch.length, updates.length)} of ${updates.length}`,
    );
  }

  console.log('🎉 Tag normalization complete!');
}

const isExecutedDirectly = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
  } catch {
    return false;
  }
})();

if (isExecutedDirectly) {
  runFixTags().catch((error) => {
    console.error('❌ fix_tags encountered an error:', error);
    process.exitCode = 1;
  });
}


