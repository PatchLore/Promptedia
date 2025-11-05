'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase/types';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

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

    revalidatePath('/profile');
    revalidatePath(`/prompt/${promptId}`);
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

    revalidatePath('/profile');
    revalidatePath(`/prompt/${promptId}`);
    return true;
  }
}

export async function updatePrompt(id: string, fields: Partial<any>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prompts')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update prompt: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/browse');
  revalidatePath('/');
  revalidatePath(`/prompt/${id}`);
  
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
  
  return { success: true };
}
