'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabase, PromptRow, PromptInsert, PromptUpdate } from '@/lib/supabase/client';
import { buildPromptPath, isValidSlug, slugifyTitle } from '@/lib/slug';

async function generateUniqueSlug(
  title: string,
  options: { excludeId?: string } = {}
): Promise<string> {
  const baseSlug = slugifyTitle(title).slice(0, 60).replace(/-+$/g, '');
  const fallback = randomUUID().split('-')[0];
  const initial = baseSlug || fallback;
  let candidate = initial;
  let attempt = 0;

  while (attempt < 5) {
    const result = await supabase
      .from('prompts')
      .select('id, slug')
      .eq('slug', candidate)
      .maybeSingle<PromptRow>();

    const existing: PromptRow | null = result?.data ?? null;
    const error = result?.error;

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking slug uniqueness:', error);
      }
      break;
    }

    if (!existing || (options.excludeId && existing.id === options.excludeId)) {
      return candidate;
    }

    candidate = `${initial}-${randomUUID().split('-')[0]}`;
    attempt += 1;
  }

  return `${initial}-${randomUUID().split('-')[0]}`;
}

async function revalidatePromptPaths(
  slug?: string | null,
  id?: string | null
) {
  if (id) {
    revalidatePath(`/prompt/${id}`);
    revalidatePath(buildPromptPath({ id, slug }));
    return;
  }

  if (slug) {
    revalidatePath(buildPromptPath({ id: id || slug, slug }));
  }
}

export async function createPrompt(data: {
  id?: string;
  title: string;
  slug?: string | null;
  prompt?: string | null;
  category?: string | null;
  type?: string | null;
  example_url?: string | null;
  audio_preview_url?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
  model?: string | null;
  tags?: string[] | null;
  is_public?: boolean | null;
  is_pro?: boolean | null;
  user_id?: string | null;
}): Promise<PromptRow> {
  const baseSlug = data.slug ?? data.title;
  const safeSlug = await generateUniqueSlug(baseSlug);

  const nowIso = new Date().toISOString();

  const insertData: PromptInsert = {
    id: data.id ?? randomUUID(),
    title: data.title ?? null,
    slug: safeSlug,
    prompt: data.prompt ?? null,
    category: data.category ?? null,
    type: data.type ?? null,
    example_url: data.example_url ?? null,
    audio_preview_url: data.audio_preview_url ?? null,
    thumbnail_url: data.thumbnail_url ?? null,
    description: data.description ?? null,
    model: data.model ?? null,
    tags: data.tags ?? null,
    is_public: data.is_public ?? true,
    is_pro: data.is_pro ?? false,
    user_id: data.user_id ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('prompts')
    .insert(insertData)
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, updated_at, example_url, thumbnail_url, model, type, is_public, is_pro'
    )
    .single<PromptRow>();

  if (insertError || !inserted) {
    throw new Error(`Failed to create prompt: ${insertError?.message || 'Unknown error'}`);
  }

  const prompt = inserted;

  revalidatePath('/browse');
  revalidatePath('/');
  revalidatePromptPaths(prompt.slug, prompt.id);
  return prompt;
}

export async function toggleFavorite(promptId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Check if favorite already exists
  const { data: existingFavorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .maybeSingle<{ id: string }>();

  if (existingFavorite?.id) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFavorite.id);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    const { data: promptMeta } = await supabase
      .from('prompts')
      .select('id, slug')
      .eq('id', promptId)
      .maybeSingle<PromptRow>();

    revalidatePath('/profile');
    revalidatePromptPaths(promptMeta?.slug, promptId);
    return false;
  } else {
    // Add favorite
    const { error } = await supabase.from('favorites').insert([
      {
        user_id: user.id,
        prompt_id: promptId,
      },
    ]);

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }

    const { data: promptMeta } = await supabase
      .from('prompts')
      .select('id, slug')
      .eq('id', promptId)
      .maybeSingle<PromptRow>();

    revalidatePath('/profile');
    revalidatePromptPaths(promptMeta?.slug, promptId);
    return true;
  }
}

export async function updatePrompt(id: string, fields: PromptUpdate): Promise<PromptRow> {
  const { data: existingPrompt } = await supabase
    .from('prompts')
    .select('id, slug')
    .eq('id', id)
    .maybeSingle<PromptRow>();

  const previousSlug = existingPrompt?.slug ?? null;

  let updatePayload: PromptUpdate = { ...fields };

  if (
    fields.slug === undefined &&
    typeof fields.title === 'string' &&
    fields.title.trim().length > 0
  ) {
    const newSlug = await generateUniqueSlug(fields.title, { excludeId: id });
    updatePayload.slug = newSlug;
  } else if (fields.slug && !isValidSlug(fields.slug)) {
    const safeSlug = await generateUniqueSlug(fields.slug, { excludeId: id });
    updatePayload.slug = safeSlug;
  }

  updatePayload.updated_at = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('prompts')
    .update(updatePayload)
    .eq('id', id)
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, updated_at, example_url, thumbnail_url, model, type, is_public, is_pro'
    )
    .single<PromptRow>();

  if (updateError || !updated) {
    throw new Error(`Failed to update prompt: ${updateError?.message || 'Unknown error'}`);
  }

  const prompt = updated;

  revalidatePath('/admin');
  revalidatePath('/browse');
  revalidatePath('/');
  if (previousSlug && previousSlug !== prompt.slug) {
    revalidatePath(buildPromptPath({ id, slug: previousSlug }));
  }
  revalidatePromptPaths(prompt.slug, id);
  
  return prompt;
}

export async function deletePrompt(id: string) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete prompt: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/browse');
  revalidatePath('/');
  
  revalidatePromptPaths(undefined, id);
  return { success: true };
}
