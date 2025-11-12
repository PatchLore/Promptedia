export const dynamic = "force-dynamic";

import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export default async function PromptsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const supabase = getSupabaseServerClient();
  const params = await searchParams;
  const category = params?.category || '';
  const search = params?.q || '';
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.set('q', search);
  }
  if (category) {
    queryParams.set('category', category);
  }
  const queryString = queryParams.toString();
  const canonicalUrl = `${siteUrl}/prompts${queryString ? `?${queryString}` : ''}`;

  let query = supabase
    .from('prompts')
    .select('id, slug, title, description, category, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: prompts, error } = await query;

  if (process.env.NODE_ENV === 'development') {
    console.log('[DB]', 'prompts_index', {
      search,
      category,
      results: prompts?.length ?? 0,
    });
  }

  const head = (
    <head>
      <title>All Prompts | On Point Prompt</title>
      <meta
        name="description"
        content="Explore every AI prompt on On Point Prompt. Filter by category or keyword to find the perfect idea for ChatGPT, Midjourney, and more."
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content="All Prompts | On Point Prompt" />
      <meta
        property="og:description"
        content="Browse the complete library of AI prompts across writing, art, coding, music, and business categories."
      />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}/og.png`} />
      <meta property="og:type" content="website" />
    </head>
  );

  if (error) {
    console.error('Error fetching prompts:', error);
    return (
      <WrapperClient>
        <>
          {head}
          <div className="container mx-auto max-w-screen-lg px-4 py-8 text-gray-400 dark:text-gray-300">
            Error loading prompts.
          </div>
        </>
      </WrapperClient>
    );
  }

  if (!prompts?.length) {
    return (
      <WrapperClient>
        <>
          {head}
          <div className="container mx-auto max-w-screen-lg px-4 py-8 text-gray-400 dark:text-gray-300">
            No prompts found.
          </div>
        </>
      </WrapperClient>
    );
  }

  const collectionLdJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Prompts',
    url: canonicalUrl,
    description:
      'Explore AI prompts for writing, art, coding, music, and business. Filter by category or keyword to find the right inspiration.',
    hasPart: prompts.slice(0, 20).map((prompt) => ({
      '@type': 'CreativeWork',
      name: prompt.title || 'Prompt',
      url: `${siteUrl}/prompts/${prompt.slug}`,
      datePublished: prompt.created_at ? new Date(prompt.created_at).toISOString() : undefined,
    })),
  };

  const content = (
    <>
      {head}
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLdJson) }}
        />

        <header className="py-8">
          <h1 className="text-4xl font-bold mb-8 text-white">All Prompts</h1>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            Explore the entire library of AI prompts, and refine your results by category or keyword.
          </p>
        </header>

        <section className="py-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {['Writing', 'Art', 'Coding', 'Business', 'Music'].map((cat) => {
              const isActive = category === cat;
              return (
                <Link
                  key={cat}
                  href={`/prompts?category=${cat}`}
                  className={`rounded-lg px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-800 bg-gray-900/60 text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}

            {category && (
              <Link
                href="/prompts"
                className="rounded-lg px-4 py-2 text-sm transition bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Clear
              </Link>
            )}
          </div>

          <form method="get" className="flex flex-col gap-4 md:flex-row md:items-center">
            {category && <input type="hidden" name="category" value={category} />}
            <label className="sr-only" htmlFor="prompt-search">
              Search prompts
            </label>
            <input
              id="prompt-search"
              type="text"
              name="q"
              placeholder="Search prompts..."
              defaultValue={search}
              className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm">
              Apply
            </button>
          </form>
        </section>

        <section className="py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <Link
                key={prompt.slug}
                href={`/prompts/${prompt.slug}`}
                className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm transition hover:bg-gray-900"
              >
                <h2 className="text-xl font-semibold mb-3 text-white line-clamp-2">
                  {prompt.title}
                </h2>

                {prompt.description && (
                  <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed line-clamp-3">
                    {prompt.description}
                  </p>
                )}

                <div className="mt-4 text-xs text-gray-400">
                  <span className="rounded-md bg-gray-800 px-2 py-1 text-gray-300">
                    {prompt.category || 'Uncategorised'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}

