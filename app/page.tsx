import type { Metadata } from 'next';
import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import LazyPromptGrid from '@/components/LazyPromptGrid';
import { getImageUrl } from '@/lib/getImageUrl';

export const dynamic = 'force-dynamic';

// Default OG image should be uploaded to Supabase Storage branding bucket
const DEFAULT_OG_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || getImageUrl();

export const metadata: Metadata = {
  title: 'OnPointPrompt — AI Prompts Library',
  description: 'Browse, discover and save AI prompts for art, music, writing and more.',
  openGraph: {
    title: 'OnPointPrompt — AI Prompts Library',
    description: 'Browse, discover and save AI prompts for art, music, writing and more.',
    url: 'https://www.onpointprompt.com',
    siteName: 'OnPointPrompt',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'OnPointPrompt — AI Prompts Library',
      },
    ],
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.onpointprompt.com',
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/`;

const categories = [
  { name: 'Art', slug: 'art', icon: '🎨' },
  { name: 'Music', slug: 'music', icon: '🎵' },
  { name: 'Writing', slug: 'writing', icon: '✍️' },
  { name: 'Business', slug: 'business', icon: '💼' },
  { name: 'Coding', slug: 'coding', icon: '💻' },
];

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const { data: featuredPrompts, error: featuredError } = await supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, category, tags, example_url, thumbnail_url, audio_preview_url, type, created_at'
    )
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('created_at', { ascending: false })
    .limit(12);

  if (process.env.NODE_ENV === 'development') {
    console.log('[DB]', 'featured_prompts', {
      filters: { is_public: true, is_pro: false },
      limit: 12,
    });
  }

  if (featuredError && process.env.NODE_ENV === 'development') {
    console.error('Failed to load featured prompts', featuredError);
  }

  const applyImageTransforms = (url?: string | null) => {
    if (!url || url.startsWith('data:')) return null;
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('w', parsed.searchParams.get('w') ?? '400');
      parsed.searchParams.set('q', '70');
      parsed.searchParams.set('auto', parsed.searchParams.get('auto') ?? 'format');
      return parsed.toString();
    } catch {
      return `${url}${url.includes('?') ? '&' : '?'}w=400&q=70&auto=format`;
    }
  };

  const preloadImages =
    featuredPrompts
      ?.slice(0, 3)
      .map((prompt) =>
        applyImageTransforms(prompt.thumbnail_url || prompt.example_url || undefined)
      )
      .filter((href): href is string => Boolean(href)) ?? [];

  const websiteLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'On Point Prompt',
    url: canonicalUrl,
    description:
      'On Point Prompt curates AI prompts for images, music, writing, coding, and business workflows.',
  };

  const content = (
    <>
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLdJson) }}
        />

        <section className="py-8 text-center">
          <h1 className="text-4xl font-bold mb-8 text-white">On Point Prompt</h1>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed mb-6 max-w-2xl mx-auto">
            Discover, search, and save AI prompts for image generation, music creation, writing, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm"
            >
              Browse Prompts
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm"
            >
              Submit Prompt
            </Link>
          </div>
        </section>

        <section className="py-8 text-center space-y-4">
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            On Point Prompt is your library of AI prompts for images, music, writing, coding, and business tools. Find creative inspiration instantly.
          </p>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            Search, filter, and save high-quality prompts built for Midjourney, Stable Diffusion, ChatGPT, Suno, Udio, and more. Updated regularly.
          </p>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            Start exploring trending AI prompts or dive into specific categories.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-semibold mb-4 text-white text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/browse?category=${category.slug}`}
                className="rounded-lg border border-gray-800 bg-gray-900/60 p-6 text-center shadow-sm transition hover:bg-gray-900"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <div className="font-semibold text-white">{category.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Featured Prompts</h2>
            <Link
              href="/prompts"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm"
            >
              View All Prompts
            </Link>
          </div>
          <LazyPromptGrid prompts={featuredPrompts || []} />
        </section>
      </div>
    </>
  );

  return (
    <WrapperClient>
      {content}
    </WrapperClient>
  );
}



