import type { PromptRow } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import RelatedPromptsClient from './RelatedPromptsClient';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const fallbackOgImage = '/images/default-og.png';

function resolveTitle(title?: string | null) {
  return typeof title === 'string' && title.trim().length > 0 ? title.trim() : 'Unnamed Prompt';
}

function resolveDescription(description?: string | null) {
  return typeof description === 'string' && description.trim().length > 5
    ? description
    : 'No description available.';
}

function resolveImageUrl(...urls: Array<string | null | undefined>) {
  for (const url of urls) {
    if (typeof url === 'string' && url.trim().length > 0 && url.startsWith('http')) {
      return url;
    }
  }
  return fallbackOgImage;
}

function resolveTags(tags?: string[] | null) {
  if (Array.isArray(tags) && tags.length > 0) {
    return tags;
  }
  return ['untagged'];
}

export default async function PromptSlugPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServerClient();

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, updated_at, example_url, thumbnail_url, model, type'
    )
    .eq('slug', params.slug)
    .single<PromptRow>();

  if (error || !prompt || !prompt.slug) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Prompt fetch error:', error);
    }
    notFound();
  }

  const safeTitle = resolveTitle(prompt.title);
  const safeDescription = resolveDescription(prompt.description);
  const safeTags = resolveTags(prompt.tags);
  const ogImage = resolveImageUrl(prompt.thumbnail_url, prompt.example_url, `${siteUrl}/og.png`);

  if (process.env.NODE_ENV === 'development') {
    console.log('[DB]', 'prompt_detail', {
      slug: params.slug,
      category: prompt.category,
    });
  }

  const canonicalUrl = `${siteUrl}/prompts/${prompt.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: safeTitle,
    description: safeDescription,
    url: canonicalUrl,
    image: ogImage,
    datePublished: prompt.created_at || undefined,
    dateModified: prompt.updated_at || undefined,
    inLanguage: 'en',
  };

  const content = (
    <>
      <head>
        <title>{`${safeTitle} | On Point Prompt`}</title>
        <meta
          name="description"
          content={safeDescription}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${safeTitle} | On Point Prompt`} />
        <meta
          property="og:description"
          content={safeDescription}
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage || fallbackOgImage} />
        <meta property="og:type" content="article" />
      </head>

      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />

        <header className="py-8">
          <h1 className="text-4xl font-bold mb-8 text-white">{safeTitle}</h1>
          <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            {safeDescription}
          </p>
        </header>

        {prompt.prompt && (
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Prompt</h2>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-sm">
              <pre className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed mb-6">
                {prompt.prompt}
              </pre>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(prompt.prompt ?? '')}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm"
                >
                  Copy Prompt
                </button>
                {prompt.example_url && (
                  <a
                    href={prompt.example_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm text-center"
                  >
                    Open Example
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Prompt Details</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-sm text-gray-400 dark:text-gray-300 text-base leading-relaxed">
            <p>
              <span className="text-white font-medium">Category:</span>{' '}
              {prompt.category || 'Uncategorised'}
            </p>
            {prompt.model && (
              <p className="mt-3">
                <span className="text-white font-medium">Model:</span> {prompt.model}
              </p>
            )}
            {safeTags.length > 0 && (
              <p className="mt-3">
                <span className="text-white font-medium">Tags:</span> {safeTags.join(', ')}
              </p>
            )}
          </div>
        </section>

        {prompt.category && (
          <section className="py-8">
            <h3 className="text-xl font-semibold mb-4 text-white">Related Prompts</h3>
            <RelatedPromptsClient category={prompt.category} excludeSlug={prompt.slug} />
          </section>
        )}
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
