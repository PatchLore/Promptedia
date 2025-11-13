import 'dotenv/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type PackInsert = {
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
};

type PackPromptsInsert = {
  pack_id: string;
  prompt_id: string;
};

const samplePacks: PackInsert[] = [
  {
    title: '100 ChatGPT Prompts for Creators',
    slug: '100-chatgpt-prompts-for-creators',
    description: 'Turbocharge content ideas, scripts, hooks, and outlines.',
    category: 'writing',
    price: 12,
    image_url: 'https://placehold.co/600x400',
  },
  {
    title: '50 Music Prompts for AI Musicians',
    slug: '50-music-prompts-for-ai-musicians',
    description: 'Genres, moods, and structures for generative audio.',
    category: 'music',
    price: 9,
    image_url: 'https://placehold.co/600x400',
  },
  {
    title: '80 Image Prompts for Midjourney',
    slug: '80-image-prompts-for-midjourney',
    description: 'Curated styles and scenes for striking visuals.',
    category: 'art',
    price: 10,
    image_url: 'https://placehold.co/600x400',
  },
];

async function seedPacks() {
  const supabase = getSupabaseServerClient();

  console.log('🔄 Starting pack seeding...');

  // Step 1: Insert packs using upsert with slug as unique key
  console.log('📦 Inserting packs...');
  const packInserts = samplePacks;

  const { data: insertedPacks, error: packsError } = await (supabase as any)
    .from('packs')
    .upsert(packInserts, {
      onConflict: 'slug',
      ignoreDuplicates: false,
    })
    .select();

  if (packsError) {
    throw new Error(`Failed to insert packs: ${packsError.message}`);
  }

  console.log('✅ Inserted packs:', insertedPacks);

  // Step 2: Fetch all packs
  const { data: allPacks, error: fetchError } = await (supabase as any)
    .from('packs')
    .select('id, slug, category')
    .order('created_at', { ascending: false });

  if (fetchError) {
    throw new Error(`Failed to fetch packs: ${fetchError.message}`);
  }

  if (!allPacks || allPacks.length === 0) {
    console.log('⚠️ No packs found after insertion.');
    return;
  }

  console.log(`📋 Found ${allPacks.length} packs total.`);

  // Step 3: For each pack, link prompts
  console.log('🔗 Linking prompts to packs...');

  for (const pack of allPacks) {
    if (!pack.id || !pack.category) {
      console.log(`⚠️ Skipping pack ${pack.slug} - missing id or category`);
      continue;
    }

    // Find prompts matching the pack's category
    const { data: categoryPrompts, error: categoryError } = await supabase
      .from('prompts')
      .select('id')
      .eq('category', pack.category)
      .eq('is_public', true)
      .limit(10);

    if (categoryError) {
      console.error(`Error fetching prompts for category ${pack.category}:`, categoryError);
      continue;
    }

    let promptIds: string[] = [];

    if (categoryPrompts && categoryPrompts.length > 0) {
      promptIds = categoryPrompts.map((p: any) => p.id).slice(0, 10);
    }

    // If fewer than 10 exist, fill in with random prompts
    if (promptIds.length < 10) {
      const needed = 10 - promptIds.length;
      const existingIdsSet = new Set(promptIds);

      // Fetch more prompts and filter out duplicates
      const { data: allPublicPrompts, error: randomError } = await supabase
        .from('prompts')
        .select('id')
        .eq('is_public', true)
        .limit(100); // Fetch more to ensure we have enough after filtering

      if (!randomError && allPublicPrompts && allPublicPrompts.length > 0) {
        const randomIds = allPublicPrompts
          .map((p: any) => p.id)
          .filter((id: string) => !existingIdsSet.has(id))
          .slice(0, needed);

        promptIds = [...promptIds, ...randomIds];
      }
    }

    if (promptIds.length === 0) {
      console.log(`⚠️ No prompts found to link to pack ${pack.slug}`);
      continue;
    }

    // Check existing links to avoid duplicates
    const { data: existingLinks, error: linksError } = await (supabase as any)
      .from('pack_prompts')
      .select('prompt_id')
      .eq('pack_id', pack.id);

    if (linksError) {
      console.error(`Error checking existing links for pack ${pack.slug}:`, linksError);
      continue;
    }

    const existingPromptIds = new Set(
      (existingLinks || []).map((link: any) => link.prompt_id)
    );

    // Filter out prompts that are already linked
    const newPromptIds = promptIds.filter((id) => !existingPromptIds.has(id));

    if (newPromptIds.length === 0) {
      console.log(`ℹ️ Pack ${pack.slug} already has all prompts linked.`);
      continue;
    }

    // Insert new links using upsert to handle duplicates gracefully
    const packPromptsInserts: PackPromptsInsert[] = newPromptIds.map((promptId) => ({
      pack_id: pack.id,
      prompt_id: promptId,
    }));

    // Try upsert first, fall back to insert if upsert fails
    const { error: insertLinksError } = await (supabase as any)
      .from('pack_prompts')
      .upsert(packPromptsInserts, {
        onConflict: 'pack_id,prompt_id',
      })
      .select();

    if (insertLinksError) {
      console.error(`Error linking prompts to pack ${pack.slug}:`, insertLinksError);
      continue;
    }

    console.log(`✅ Linked ${newPromptIds.length} prompts to pack ${pack.slug}`);
  }

  console.log('🎉 Pack seeding complete!');
  console.log('✅ Linked prompts to packs.');
}

// Run the script
seedPacks().catch((error) => {
  console.error('❌ Seed packs encountered an error:', error);
  process.exitCode = 1;
});

