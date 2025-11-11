import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type PromptRecord = Pick<
  Database['public']['Tables']['prompts']['Row'],
  'id' | 'description' | 'title' | 'tags'
> & {
  logo_url?: string | null;
};

type PromptUpdate = {
  id: string;
  description?: string;
  title?: string;
  tags?: string[];
  logo_url?: string | null;
};

const FETCH_PAGE_SIZE = 1000;
const UPDATE_BATCH_SIZE = 100;
const FALLBACK_DESCRIPTION = 'No description available.';
const FALLBACK_LOGO = '/images/placeholder.svg';
const FALLBACK_TITLE = 'Unnamed Prompt';
const FALLBACK_TAGS = ['untagged'];

function getSupabaseClient(): SupabaseClient<Database> {
  const url =
    process.env.SUPABASE_URL ??
    process.env.SUPABASE_PROJECT_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL environment variable for fix_missing_metadata script.');
  }

  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable for fix_missing_metadata script.');
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

function isBlank(value: unknown): boolean {
  if (typeof value !== 'string') {
    return value == null;
  }
  return value.trim().length === 0;
}

function needsDescriptionUpdate(description: PromptRecord['description']): boolean {
  if (typeof description !== 'string') {
    return true;
  }
  const trimmed = description.trim();
  return trimmed.length < 5;
}

function needsLogoUpdate(logoUrl: PromptRecord['logo_url']): boolean {
  if (typeof logoUrl !== 'string') {
    return true;
  }
  const trimmed = logoUrl.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return !trimmed.toLowerCase().startsWith('http');
}

function needsTitleUpdate(title: PromptRecord['title']): boolean {
  if (typeof title !== 'string') {
    return true;
  }
  return title.trim().length === 0;
}

function needsTagsUpdate(tags: PromptRecord['tags']): boolean {
  if (!Array.isArray(tags)) {
    return true;
  }
  return tags.length === 0;
}

type RawPromptRecord = {
  id: string;
  description: string | null;
  title: string | null;
  tags: string[] | null;
  logo_url?: string | null;
};

async function fetchAllPrompts(client: SupabaseClient<Database>): Promise<PromptRecord[]> {
  const records: PromptRecord[] = [];
  let from = 0;

  for (;;) {
    const to = from + FETCH_PAGE_SIZE - 1;
    const { data, error } = await client
      .from('prompts')
      .select('id, description, title, tags, logo_url', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    const typedData = (data ?? []) as RawPromptRecord[];

    records.push(
      ...typedData.map((item) => ({
        id: item.id,
        description: item.description,
        title: item.title,
        tags: Array.isArray(item.tags) ? item.tags : [],
        logo_url: item.logo_url,
      })),
    );

    if (data.length < FETCH_PAGE_SIZE) {
      break;
    }

    from += FETCH_PAGE_SIZE;
  }

  return records;
}

function buildMetadataUpdates(prompts: PromptRecord[]): {
  updates: PromptUpdate[];
  skippedIds: string[];
} {
  const updates: PromptUpdate[] = [];
  const skippedIds: string[] = [];

  for (const prompt of prompts) {
    if (!prompt?.id) continue;

    const next: PromptUpdate = { id: prompt.id };
    let changed = false;

    if (needsDescriptionUpdate(prompt.description)) {
      next.description = FALLBACK_DESCRIPTION;
      changed = true;
    }

    if (needsLogoUpdate(prompt.logo_url ?? null)) {
      next.logo_url = FALLBACK_LOGO;
      changed = true;
    }

    if (needsTitleUpdate(prompt.title)) {
      next.title = FALLBACK_TITLE;
      changed = true;
    }

    if (needsTagsUpdate(prompt.tags)) {
      next.tags = FALLBACK_TAGS;
      changed = true;
    }

    if (changed) {
      updates.push(next);
    } else {
      skippedIds.push(prompt.id);
    }
  }

  return { updates, skippedIds };
}

export async function runFixMissingMetadata(): Promise<void> {
  const client = getSupabaseClient();

  console.log('🔄 Fetching prompts to normalize metadata…');
  const prompts = await fetchAllPrompts(client);
  console.log(`📄 Retrieved ${prompts.length} prompts for metadata validation.`);

  const { updates, skippedIds } = buildMetadataUpdates(prompts);

  console.log(`✅ Prompts already valid: ${skippedIds.length}`);

  if (updates.length === 0) {
    console.log('✨ No metadata updates required. All prompts already normalized.');
    return;
  }

  console.log(`✏️ Preparing to update ${updates.length} prompts in batches of ${UPDATE_BATCH_SIZE}…`);

  for (let index = 0; index < updates.length; index += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(index, index + UPDATE_BATCH_SIZE);
    const updatePromises = batch.map(async (entry) => {
      const { id, ...fields } = entry;
      const updatesToApply: Record<string, unknown> = {};

      if ('description' in fields) updatesToApply.description = fields.description;
      if ('logo_url' in fields) updatesToApply.logo_url = fields.logo_url;
      if ('title' in fields) updatesToApply.title = fields.title;
      if ('tags' in fields) updatesToApply.tags = fields.tags;

      if (Object.keys(updatesToApply).length === 0) {
        return;
      }

      const promptTable = client.from('prompts') as any;
      const { error } = await promptTable.update(updatesToApply).eq('id', id).select('id').single();

      if (error) {
        throw new Error(`Failed to update prompt ${id}: ${error.message}`);
      }
    });

    await Promise.all(updatePromises);

    console.log(
      `✅ Updated metadata for prompts ${index + 1}-${Math.min(index + batch.length, updates.length)} of ${updates.length}`,
    );
  }

  console.log('🎉 Metadata cleanup complete!');
  console.log(`📊 Total prompts updated: ${updates.length}`);

  const sample = updates.slice(0, 5);
  if (sample.length > 0) {
    console.log('🔍 Sample of updates:');
    for (const entry of sample) {
      console.log(`  - Prompt ${entry.id}:`, JSON.stringify(entry, null, 2));
    }
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
  runFixMissingMetadata().catch((error) => {
    console.error('❌ fix_missing_metadata encountered an error:', error);
    process.exitCode = 1;
  });
}


