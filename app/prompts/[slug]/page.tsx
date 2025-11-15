import type { PromptRow } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import RelatedPromptsClient from './RelatedPromptsClient';
import PromptDetailClient from './PromptDetailClient';
import { getImageUrl } from '@/lib/getImageUrl';
import type { Metadata } from 'next';
import { isImagePrompt } from '@/lib/isImagePrompt';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
// Default OG image should be uploaded to Supabase Storage branding bucket
const DEFAULT_OG_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || getImageUrl();

function resolveTitle(title?: string | null) {
  return typeof title === 'string' && title.trim().length > 0 ? title.trim() : 'Unnamed Prompt';
}

function resolveImageUrl(...urls: Array<string | null | undefined>) {
  for (const url of urls) {
    if (typeof url === 'string' && url.trim().length > 0 && url.startsWith('http')) {
      return url;
    }
  }
  return DEFAULT_OG_IMAGE;
}

function resolveTags(tags?: string[] | null): string[] {
  if (Array.isArray(tags) && tags.length > 0) {
    return tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
  }
  return [];
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, slug, description, category, thumbnail_url, image_url, example_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!prompt) {
    return {
      title: 'Prompt Not Found | OnPointPrompt',
      description: 'This AI prompt could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const ogImage = prompt.image_url || prompt.thumbnail_url || prompt.example_url || DEFAULT_OG_IMAGE;
  const description = prompt.description && !/no description available/i.test(prompt.description)
    ? prompt.description.trim()
    : `Explore the prompt: ${prompt.title}.`;

  return {
    title: `${prompt.title} | AI Prompt`,
    description: description,
    alternates: {
      canonical: `${baseUrl}/prompts/${prompt.slug}`,
    },
    openGraph: {
      title: prompt.title,
      description: description,
      url: `${baseUrl}/prompts/${prompt.slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: prompt.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: prompt.title,
      description: description,
      images: [ogImage],
    },
  };
}

export default async function PromptSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, updated_at, example_url, thumbnail_url, image_url, audio_preview_url, model, type'
    )
    .eq('slug', slug)
    .maybeSingle<PromptRow>();

  // Debug: Log fetch result in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[PromptSlugPage] Fetch result:', {
      slug,
      found: !!prompt,
      error: error?.message,
      promptId: prompt?.id,
      promptTitle: prompt?.title,
    });
  }

  // Clean check: if prompt doesn't exist, show 404
  if (!prompt) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PromptSlugPage] Prompt not found, calling notFound()', { slug });
    }
    notFound();
  }

  const safeTitle = resolveTitle(prompt.title);
  const safeTags = resolveTags(prompt.tags);
  const ogImage = resolveImageUrl((prompt as any).image_url, prompt.thumbnail_url, prompt.example_url);
  const canonicalUrl = `${siteUrl}/prompts/${prompt.slug}`;
  
  // Get description - filter out placeholder text
  const description = prompt.description &&
    !/no description available/i.test(prompt.description) &&
    prompt.description.trim()
    ? prompt.description.trim()
    : null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: safeTitle,
    description: description || 'Creative prompt from On Point Prompt.',
    url: canonicalUrl,
    image: ogImage,
    genre: prompt.category || undefined,
    datePublished: prompt.created_at || undefined,
    dateModified: prompt.updated_at || undefined,
    inLanguage: 'en',
  };

  const content = (
    <>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />

        <header>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{safeTitle}</h1>
          {prompt.description &&
            !/no description available/i.test(prompt.description) && (
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                {prompt.description}
              </p>
            )}
        </header>

        {(prompt as any).image_url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
            <Image
              src={(prompt as any).image_url}
              alt={safeTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          </div>
        )}

        <PromptDetailClient prompt={prompt} />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            <strong className="text-gray-900 dark:text-white">Category:</strong>{' '}
            {prompt.category || 'Uncategorised'}
          </p>

          {isImagePrompt(prompt.model, prompt.category, prompt.tags) ? (
            <p><strong>Model:</strong> {prompt.model}</p>
          ) : null}

          {safeTags && safeTags.length > 0 && (
            <p>
              <strong className="text-gray-900 dark:text-white">Tags:</strong> {safeTags.join(', ')}
            </p>
          )}
        </div>

        {prompt.category && (
          <section className="pt-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related Prompts</h3>
            <RelatedPromptsClient category={prompt.category} excludeSlug={prompt.slug} />
          </section>
        )}
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
