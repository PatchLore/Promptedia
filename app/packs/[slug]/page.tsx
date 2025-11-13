import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';
import PackCard from '@/components/PackCard';
import PromptCard from '@/components/PromptCard';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getImageUrl } from '@/lib/getImageUrl';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

type PackPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: pack } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!pack) {
    return { title: 'Pack Not Found | OnPointPrompt' };
  }

  return {
    title: `${pack.title} | Prompt Pack`,
    description: pack.description || `Explore the ${pack.title} AI prompt pack.`,
    openGraph: {
      title: pack.title,
      description: pack.description || `Explore the ${pack.title} AI prompt pack.`,
      url: `/packs/${slug}`,
      images: pack.image_url ? [pack.image_url] : [],
    },
  };
}

export default async function PackPage({ params }: PackPageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  // Load pack
  const { data: pack, error: packError } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (packError || !pack) {
    return (
      <WrapperClient>
        <div className="p-10 text-center">Pack not found.</div>
      </WrapperClient>
    );
  }

  // Load prompts in this pack via pack_prompts junction table
  let prompts: any[] = [];
  try {
    const { data: packPromptsData } = await (supabase as any)
      .from('pack_prompts')
      .select('prompt_id')
      .eq('pack_id', pack.id);

    if (packPromptsData && packPromptsData.length > 0) {
      const promptIds = packPromptsData.map((item: any) => item.prompt_id);
      
      const { data: promptsData } = await supabase
        .from('prompts')
        .select('*')
        .in('id', promptIds)
        .eq('is_public', true);

      prompts = promptsData || [];
    }
  } catch (error) {
    // If pack_prompts table doesn't exist or relation fails, prompts will be empty
    console.error('Error loading pack prompts:', error);
  }

  // Load related packs (same category)
  const { data: related } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('category', pack.category)
    .neq('id', pack.id)
    .limit(3);

  // Format price - handle both numeric and string formats
  const formatPrice = (price: number | string | null | undefined): string => {
    if (typeof price === 'number') {
      return `£${price}`;
    }
    if (typeof price === 'string') {
      // If it already has a currency symbol, return as is
      if (price.startsWith('£') || price.startsWith('$')) {
        return price.replace('$', '£');
      }
      // If it's a number string, add £
      return `£${price}`;
    }
    return '£0';
  };

  const displayPrice = formatPrice(pack.price);

  return (
    <WrapperClient>
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/packs"
            className="text-blue-600 hover:underline text-sm font-medium dark:text-blue-400"
          >
            ← Back to Packs
          </Link>
        </div>

        <div className="space-y-12">
          {/* Title + Description */}
          <section>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {pack.title}
          </h1>

          <img
            src={getImageUrl(pack.image_url)}
            alt={pack.title}
            className="w-full h-auto rounded-xl mt-4 shadow"
          />

          <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed text-lg">
            {pack.description}
          </p>
        </section>

        {/* Pricing + CTA */}
        <section className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Get This Pack
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Includes {prompts.length} prompts.
          </p>

          {pack.price && (
            <p className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {displayPrice}
            </p>
          )}

          <a
            href={`/buy/${pack.slug}`}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg inline-block hover:bg-blue-700 transition font-medium"
          >
            Buy Now
          </a>
        </section>

        {/* Included Prompts */}
        {prompts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Included Prompts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {prompts.map((prompt: any) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>
        )}

        {/* Related Packs */}
        {related && related.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Related Packs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((p: any) => (
                <PackCard
                  key={p.id}
                  pack={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    summary: p.description || '',
                    price: formatPrice(p.price),
                    url: `/buy/${p.slug}`,
                  }}
                />
              ))}
            </div>
          </section>
        )}
        </div>
      </main>
    </WrapperClient>
  );
}
