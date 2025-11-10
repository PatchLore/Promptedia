import type { PromptRow } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import WrapperClient from '@/app/WrapperClient';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

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

  const canonicalUrl = `${siteUrl}/prompts/${prompt.slug}`;

  let relatedPrompts: { title: string | null; slug: string }[] = [];

  if (prompt.category) {
    const { data: relatedData, error: relatedError } = await supabase
      .from('prompts')
      .select('title, slug')
      .eq('category', prompt.category)
      .neq('slug', prompt.slug)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!relatedError && relatedData) {
      relatedPrompts = relatedData
        .filter((item): item is { title: string | null; slug: string } => Boolean(item.slug))
        .map(({ title, slug }) => ({ title, slug }));
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt.title,
    description: prompt.description || '',
    url: canonicalUrl,
    image: prompt.thumbnail_url || prompt.example_url || `${siteUrl}/og.png`,
    datePublished: prompt.created_at || undefined,
    dateModified: prompt.updated_at || undefined,
    inLanguage: 'en',
  };

  const content = (
    <>
      <head>
        <title>{`${prompt.title} | On Point Prompt`}</title>
        <meta
          name="description"
          content={
            prompt.description ||
            `Discover the ${prompt.title} prompt on On Point Prompt and use it in your next AI project.`
          }
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${prompt.title} | On Point Prompt`} />
        <meta
          property="og:description"
          content={
            prompt.description ||
            `Explore the ${prompt.title} prompt and apply it to your AI workflow.`
          }
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={prompt.thumbnail_url || prompt.example_url || `${siteUrl}/og.png`} />
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
          <h1 className="text-4xl font-bold mb-8 text-white">{prompt.title}</h1>
          {prompt.description && (
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              {prompt.description}
            </p>
          )}
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
          </div>
        </section>

        {relatedPrompts.length > 0 && (
          <section className="py-8">
            <h3 className="text-xl font-semibold mb-4 text-white">Related Prompts</h3>
            <ul className="space-y-3">
              {relatedPrompts.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/prompts/${related.slug}`}
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    {related.title || 'Untitled Prompt'}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
