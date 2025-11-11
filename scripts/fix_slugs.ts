import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type PromptRecord = Pick<Database['public']['Tables']['prompts']['Row'], 'id' | 'slug' | 'title'>;

const FETCH_PAGE_SIZE = 1000;
const UPDATE_BATCH_SIZE = 100;

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
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable.');
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

async function fetchAllPrompts(client: SupabaseClient<Database>): Promise<PromptRecord[]> {
  const results: PromptRecord[] = [];
  let from = 0;

  for (;;) {
    const to = from + FETCH_PAGE_SIZE - 1;
    const { data, error } = await client
      .from('prompts')
      .select('id, slug, title', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    results.push(...data);

    if (data.length < FETCH_PAGE_SIZE) {
      break;
    }

    from += FETCH_PAGE_SIZE;
  }

  return results;
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  let candidate = baseSlug;
  let counter = 1;

  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  existingSlugs.add(candidate);

  return candidate;
}

type SlugResolution = {
  promptId: string;
  originalSlug: string | null;
  newSlug: string;
};

function resolveDuplicateSlugs(prompts: PromptRecord[]): SlugResolution[] {
  const seenSlugs = new Map<string, PromptRecord[]>();

  for (const prompt of prompts) {
    const key = (prompt.slug ?? '').trim();
    if (!seenSlugs.has(key)) {
      seenSlugs.set(key, []);
    }
    seenSlugs.get(key)!.push(prompt);
  }

  const existingSlugs = new Set<string>();
  const updates: SlugResolution[] = [];

  for (const [slug, entries] of seenSlugs.entries()) {
    if (slug && !existingSlugs.has(slug)) {
      existingSlugs.add(slug);
    }

    if (entries.length <= 1) {
      continue;
    }

    for (let index = 0; index < entries.length; index += 1) {
      const prompt = entries[index];
      if (!prompt.slug || prompt.slug.trim() === '') {
        continue;
      }

      if (index === 0) {
        // first duplicate keeps original slug
        continue;
      }

      const uniqueSlug = generateUniqueSlug(prompt.slug.trim(), existingSlugs);
      updates.push({
        promptId: prompt.id,
        originalSlug: prompt.slug,
        newSlug: uniqueSlug,
      });
    }
  }

  return updates;
}

export async function runFixSlugs(): Promise<void> {
  const client = getSupabaseClient();
  console.log('🔄 Fetching prompts to analyze slug conflicts…');
  const prompts = await fetchAllPrompts(client);
  console.log(`📄 Retrieved ${prompts.length} prompts. Checking duplicates…`);

  const updates = resolveDuplicateSlugs(prompts);

  if (updates.length === 0) {
    console.log('✨ No duplicate slugs detected. Everything looks good!');
    return;
  }

  console.log(`✏️ Found ${updates.length} duplicate slug entries to fix. Updating in batches of ${UPDATE_BATCH_SIZE}…`);

  for (let index = 0; index < updates.length; index += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(index, index + UPDATE_BATCH_SIZE);
    const updatePromises = batch.map(async (entry) => {
      const { promptId, newSlug } = entry;

      const promptTable = client.from('prompts') as any;
      const { error } = await promptTable
        .update({ slug: newSlug })
        .neq('slug', null)
        .eq('id', promptId)
        .select('id')
        .single();

      if (error) {
        throw new Error(
          `Failed to update slug for prompt ${promptId} to "${newSlug}": ${error.message}`,
        );
      }
    });

    await Promise.all(updatePromises);

    console.log(
      `✅ Updated slug batch ${index + 1}-${Math.min(index + batch.length, updates.length)} of ${updates.length}`,
    );
  }

  console.log('🎉 Slug conflict resolution complete!');
  console.log(`📊 Total duplicates fixed: ${updates.length}`);
  console.log('🔁 Slug mappings:');
  for (const entry of updates) {
    console.log(`  - ${entry.originalSlug} → ${entry.newSlug}`);
  }
}

const isExecutedDirectly = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
  } catch {
    return false;
  }
})();

if (isExecutedDirectly) {
  runFixSlugs().catch((error) => {
    console.error('❌ fix_slugs encountered an error:', error);
    process.exitCode = 1;
  });
}


