'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase/types';
import { buildPromptPath, isValidSlug, slugifyTitle } from '@/lib/slug';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  options: { excludeId?: string } = {}
): Promise<string> {
  const baseSlug = slugifyTitle(title).slice(0, 60).replace(/-+$/g, '');
  const fallback = randomUUID().split('-')[0];
  const initial = baseSlug || fallback;
  let candidate = initial;
  let attempt = 0;

  while (attempt < 5) {
    const { data: existing, error } = await supabase
      .from('prompts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

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
  title: string;
  prompt: string;
  category: string;
  type: string;
  example_url?: string;
  model?: string;
  tags?: string[];
  is_public: boolean;
  is_pro: boolean;
  user_id: string | null;
}) {
  const supabase = await createClient();

  const slug = await generateUniqueSlug(supabase, data.title);

  const insertData: PromptInsert = {
    title: data.title,
    prompt: data.prompt,
    category: data.category,
    type: data.type,
    example_url: data.example_url || null,
    model: data.model || null,
    tags: data.tags || null,
    is_public: data.is_public,
    is_pro: data.is_pro,
    user_id: data.user_id,
    slug,
  };

  const { data: prompt, error } = await supabase
    .from('prompts')
    .insert([insertData] as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create prompt: ${error.message}`);
  }

  revalidatePath('/browse');
  revalidatePath('/');
  revalidatePromptPaths(prompt.slug, prompt.id);
  return prompt;
}

export async function toggleFavorite(promptId: string) {
  const supabase = await createClient();

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
    .maybeSingle();

  if (existingFavorite && (existingFavorite as any).id) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', (existingFavorite as any).id);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    const { data: promptMeta } = await supabase
      .from('prompts')
      .select('slug')
      .eq('id', promptId)
      .maybeSingle();

    revalidatePath('/profile');
    revalidatePromptPaths(promptMeta?.slug, promptId);
    return false;
  } else {
    // Add favorite
    const { error } = await (supabase.from('favorites') as any).insert([
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
      .select('slug')
      .eq('id', promptId)
      .maybeSingle();

    revalidatePath('/profile');
    revalidatePromptPaths(promptMeta?.slug, promptId);
    return true;
  }
}

type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

export async function updatePrompt(id: string, fields: PromptUpdate) {
  const supabase = await createClient();

  const { data: existingPrompt } = await supabase
    .from('prompts')
    .select('slug')
    .eq('id', id)
    .maybeSingle();

  const previousSlug = existingPrompt?.slug || null;

  let updatePayload = { ...fields };

  if (
    fields.slug === undefined &&
    typeof fields.title === 'string' &&
    fields.title.trim().length > 0
  ) {
    const newSlug = await generateUniqueSlug(supabase, fields.title, { excludeId: id });
    updatePayload = {
      ...updatePayload,
      slug: newSlug,
    };
  } else if (fields.slug && !isValidSlug(fields.slug)) {
    const safeSlug = await generateUniqueSlug(supabase, fields.slug, { excludeId: id });
    updatePayload = {
      ...updatePayload,
      slug: safeSlug,
    };
  }

  const { data, error } = await (supabase.from('prompts') as any)
    .update(updatePayload as PromptUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update prompt: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/browse');
  revalidatePath('/');
  if (previousSlug && previousSlug !== data?.slug) {
    revalidatePath(buildPromptPath({ id, slug: previousSlug }));
  }
  revalidatePromptPaths(data?.slug, id);
  
  return data;
}

export async function deletePrompt(id: string) {
  const supabase = await createClient();

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
