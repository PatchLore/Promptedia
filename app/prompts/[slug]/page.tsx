import { supabase, PromptRow } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import WrapperClient from '@/app/WrapperClient';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const canonical = `${siteUrl}/prompts/${params.slug}`;

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('title, description, category, slug')
    .eq('slug', params.slug)
    .single<Pick<PromptRow, 'title' | 'description' | 'category' | 'slug'>>();

  if (error || !prompt) {
    return {
      title: `${params.slug} | On Point Prompt`,
      description: `AI prompt: ${params.slug}`,
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${params.slug} | On Point Prompt`,
        description: `AI prompt: ${params.slug}`,
        url: canonical,
        images: [{ url: '/og.png', width: 1200, height: 630 }],
      },
    };
  }

  const title = prompt.title || `${params.slug} | On Point Prompt`;
  const description = prompt.description || `AI prompt: ${prompt.title || params.slug}`;
  const category = prompt.category || 'Prompt';
  const ogImageUrl = `${siteUrl}/prompts/${prompt.slug}/opengraph-image?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImageUrl }],
    },
  };
}

export default async function PromptSlugPage({ params }: { params: { slug: string } }) {
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('slug', params.slug)
    .single<PromptRow>();

  if (error || !prompt || !prompt.slug) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Prompt fetch error:', error);
    }
    notFound();
  }

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
      relatedPrompts = relatedData.filter((item): item is { title: string | null; slug: string } => Boolean(item.slug))
        .map(({ title, slug }) => ({ title, slug }));
    }
  }

  const content = (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: prompt.title,
            description: prompt.description || '',
            url: `${siteUrl}/prompts/${prompt.slug}`,
            image: prompt.example_url || undefined,
            datePublished: prompt.created_at || '',
            inLanguage: 'en',
          }),
        }}
      />
      <h1 className="text-4xl font-bold mb-6 text-white">{prompt.title}</h1>

      {prompt.description && (
        <p className="text-gray-300 text-lg mb-8">{prompt.description}</p>
      )}

      {prompt.prompt && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-3 text-white">Prompt</h2>
          <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">
            {prompt.prompt}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(prompt.prompt ?? '')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-md"
          >
            Copy Prompt
          </button>
        </div>
      )}

      <div className="text-sm text-gray-400 mt-4">
        <span className="font-medium text-gray-300">Category:</span>{' '}
        {prompt.category || 'Uncategorised'}
      </div>

      {relatedPrompts.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-bold mb-4">Related Prompts</h3>
          <ul className="space-y-2">
            {relatedPrompts.map((related) => (
              <li key={related.slug}>
                <Link href={`/prompts/${related.slug}`} className="text-blue-600 hover:underline">
                  {related.title || 'Untitled Prompt'}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
