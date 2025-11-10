import { buildPromptUrl } from '@/lib/slug';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import LazyBrowseClient from '@/components/LazyBrowseClient';

export const dynamic = 'force-dynamic';

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Art', slug: 'art' },
  { name: 'Music', slug: 'music' },
  { name: 'Writing', slug: 'writing' },
  { name: 'Business', slug: 'business' },
  { name: 'Coding', slug: 'coding' },
];

const categoryContentMap: Record<string, { title: string; intro: string }> = {
  art: {
    title: 'Art Prompts',
    intro: 'Explore AI art prompts for Midjourney, Stable Diffusion, and other image generators to spark visual creativity.',
  },
  music: {
    title: 'Music Prompts',
    intro: 'Discover AI music generation prompts for Suno, Udio, and SoundSwoop. Create melodies and soundscapes instantly.',
  },
  writing: {
    title: 'Writing Prompts',
    intro: 'Browse creative writing prompts inspired by AI storytelling to craft narratives, dialogue, and more.',
  },
  business: {
    title: 'Business Prompts',
    intro: 'Find powerful business prompts for sales scripts, marketing copy, and data-driven analysis with AI.',
  },
  coding: {
    title: 'Coding Prompts',
    intro: 'AI coding prompts for debugging, code generation, refactoring, and learning new languages faster.',
  },
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: { search?: string; category?: string };
}) {
  const supabase = getSupabaseServerClient();
  const search = searchParams?.search ?? '';
  const category = searchParams?.category ?? 'all';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const baseUrl = siteUrl;
  const canonicalUrl = `${siteUrl}/browse`;

  let query = supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, example_url, thumbnail_url, type'
    )
    .eq('is_public', true)
    .eq('is_pro', false);

  if (category !== 'all') {
    const categoryFilter = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    query = query.eq('category', categoryFilter);
  }

  const { data: prompts, error } = await query.order('created_at', { ascending: false });

  if (process.env.NODE_ENV === 'development') {
    console.log('[DB]', 'browse_prompts', {
      category,
      search,
      results: prompts?.length ?? 0,
    });
  }

  if (error) {
    console.error('Supabase query error:', error);
  }

  const normalizedCategory = category.toLowerCase();
  const categoryCopy = categoryContentMap[normalizedCategory];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryCopy ? `${categoryCopy.title} - On Point Prompt` : 'Browse Prompts - On Point Prompt',
    url: canonicalUrl,
    description:
      categoryCopy?.intro ||
      'Search and filter AI prompts across art, music, writing, business, and coding categories.',
    hasPart: (prompts || []).slice(0, 20).map((p: any) => ({
      '@type': 'CreativeWork',
      name: p.title || 'Prompt',
      url: buildPromptUrl(siteUrl, p),
      datePublished: p.created_at ? new Date(p.created_at).toISOString() : undefined,
    })),
  };

  const content = (
    <>
      <head>
        <title>{categoryCopy ? `${categoryCopy.title} | On Point Prompt` : 'Browse Prompts | On Point Prompt'}</title>
        <meta
          name="description"
          content={
            categoryCopy
              ? categoryCopy.intro
              : 'Search and filter AI prompts across art, music, writing, business, and coding categories.'
          }
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta
          property="og:title"
          content={categoryCopy ? `${categoryCopy.title} | On Point Prompt` : 'Browse Prompts | On Point Prompt'}
        />
        <meta
          property="og:description"
          content={
            categoryCopy
              ? categoryCopy.intro
              : 'Search and filter AI prompts across art, music, writing, business, and coding categories.'
          }
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${siteUrl}/og.png`} />
        <meta property="og:type" content="website" />
      </head>

      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <header className="py-8 space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {categoryCopy ? categoryCopy.title : 'Browse Prompts'}
          </h1>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            {categoryCopy
              ? categoryCopy.intro
              : 'Search and filter AI prompts across every category, from art and music to business and coding.'}
          </p>
        </header>

        <section className="py-8">
          <a
            href="/packs"
            className="block w-full rounded-lg border border-gray-800 bg-gray-900/60 px-4 py-3 text-center text-white shadow-sm transition hover:bg-gray-900"
          >
            💡 Want all 100+ prompts in one pack? → Get the Creator Bundle
          </a>
        </section>

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionSchema),
          }}
        />

        <section className="py-8">
          <LazyBrowseClient
            categories={categories}
            prompts={prompts || []}
            isInitialLoad={!prompts || prompts.length === 0}
          />
        </section>
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
