'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { slugifyTitle } from '@/lib/slug';
import { randomUUID } from 'crypto';

type PackInsert = {
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  image_url?: string | null;
};

type PackUpdate = Partial<PackInsert>;

async function generateUniqueSlug(
  title: string,
  options: { excludeId?: string } = {}
): Promise<string> {
  const baseSlug = slugifyTitle(title).slice(0, 60).replace(/-+$/g, '');
  const fallback = randomUUID().split('-')[0];
  const initial = baseSlug || fallback;
  let candidate = initial;
  let attempt = 0;

  const supabase = getSupabaseServerClient();

  while (attempt < 5) {
    const { data, error } = await (supabase as any)
      .from('packs')
      .select('id, slug')
      .eq('slug', candidate)
      .maybeSingle();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking slug uniqueness:', error);
      }
      break;
    }

    if (!data || (options.excludeId && data.id === options.excludeId)) {
      return candidate;
    }

    candidate = `${initial}-${randomUUID().split('-')[0]}`;
    attempt += 1;
  }

  return `${initial}-${randomUUID().split('-')[0]}`;
}

export async function createPack(packData: PackInsert) {
  const supabase = getSupabaseServerClient();

  // Generate slug if not provided, otherwise ensure it's unique
  let slug = packData.slug.trim();
  if (!slug) {
    slug = await generateUniqueSlug(packData.title);
  } else {
    // Check if slug is already taken
    const { data: existing } = await (supabase as any)
      .from('packs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      // Slug exists, generate unique one
      slug = await generateUniqueSlug(packData.title);
    }
  }

  const { data, error } = await (supabase as any)
    .from('packs')
    .insert({
      title: packData.title,
      slug,
      description: packData.description || null,
      category: packData.category || null,
      price: packData.price || null,
      image_url: packData.image_url || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create pack: ${error.message}`);
  }

  revalidatePath('/admin/packs');
  revalidatePath('/packs');
  revalidatePath(`/packs/${slug}`);

  return data;
}

export async function updatePack(id: string, packData: PackUpdate) {
  const supabase = getSupabaseServerClient();

  // Generate slug if title changed and slug is empty
  let updateData: any = { ...packData };
  if (packData.title && !packData.slug) {
    updateData.slug = await generateUniqueSlug(packData.title, { excludeId: id });
  }

  const { data, error } = await (supabase as any)
    .from('packs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update pack: ${error.message}`);
  }

  revalidatePath('/admin/packs');
  revalidatePath('/packs');
  if (data.slug) {
    revalidatePath(`/packs/${data.slug}`);
  }

  return data;
}

export async function deletePack(id: string) {
  const supabase = getSupabaseServerClient();

  // First, delete all pack_prompts links
  await (supabase as any).from('pack_prompts').delete().eq('pack_id', id);

  // Then delete the pack
  const { error } = await (supabase as any).from('packs').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete pack: ${error.message}`);
  }

  revalidatePath('/admin/packs');
  revalidatePath('/packs');
}

export async function addPromptToPack(packId: string, promptId: string) {
  const supabase = getSupabaseServerClient();

  const { error } = await (supabase as any)
    .from('pack_prompts')
    .insert({
      pack_id: packId,
      prompt_id: promptId,
    });

  if (error) {
    // Ignore duplicate key errors
    if (error.code !== '23505') {
      throw new Error(`Failed to add prompt to pack: ${error.message}`);
    }
  }

  revalidatePath(`/admin/packs/${packId}`);
  revalidatePath(`/packs/${packId}`);
}

export async function removePromptFromPack(packId: string, promptId: string) {
  const supabase = getSupabaseServerClient();

  const { error } = await (supabase as any)
    .from('pack_prompts')
    .delete()
    .eq('pack_id', packId)
    .eq('prompt_id', promptId);

  if (error) {
    throw new Error(`Failed to remove prompt from pack: ${error.message}`);
  }

  revalidatePath(`/admin/packs/${packId}`);
  revalidatePath(`/packs/${packId}`);
}

