import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCTA from '@/components/AffiliateCTA';
import { pickAffiliateForCategoryServer } from '@/lib/affiliate-server';
import { CopyButton, FavoriteButton } from '@/components/PromptActions';
import MusicPreviewSection from '@/components/MusicPreviewSection';
import { Metadata } from 'next';
import { buildPromptPath, buildPromptUrl, isUuid } from '@/lib/slug';

type RouteParams = Record<string, string>;

async function fetchPromptByIdentifier(
  supabase: Awaited<ReturnType<typeof createClient>>,
  identifier: string
) {
  const normalized = identifier.toLowerCase();

  const { data: bySlug, error: slugError } = await supabase
    .from('prompts')
    .select('*')
    .eq('slug', normalized)
    .maybeSingle();

  if (bySlug) {
    return bySlug as any;
  }

  if (slugError && process.env.NODE_ENV === 'development') {
    console.error('Error fetching prompt by slug:', slugError);
  }

  if (isUuid(identifier)) {
    const { data: byId, error: idError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', identifier)
      .maybeSingle();

    if (byId) {
      return byId as any;
    }

    if (idError && process.env.NODE_ENV === 'development') {
      console.error('Error fetching prompt by id:', idError);
    }
  }

  return null;
}

function extractIdentifier(params: RouteParams): string | null {
  return params.id || params.slug || params.promptId || null;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const routeParams = await params;
  const identifier = extractIdentifier(routeParams);

  if (!identifier) {
    return { title: 'Prompt Not Found' };
  }

  const supabase = await createClient();
  const promptData = await fetchPromptByIdentifier(supabase, identifier);

  if (!promptData) {
    return { title: 'Prompt Not Found' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const canonicalUrl = buildPromptUrl(baseUrl, promptData);

  return {
    title: `${promptData.title || 'Prompt'} - On Point Prompt`,
    description: promptData.prompt?.substring(0, 160) || 'AI prompt from On Point Prompt',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: promptData.title || 'Prompt',
      description: promptData.prompt?.substring(0, 160) || '',
      url: canonicalUrl,
      images: promptData.example_url ? [promptData.example_url] : [],
    },
  };
}

export default async function PromptPage({ params }: { params: Promise<RouteParams> }) {
  const routeParams = await params;
  const identifier = extractIdentifier(routeParams);

  if (!identifier) {
    notFound();
  }

  const supabase = await createClient();
  const promptData = await fetchPromptByIdentifier(supabase, identifier);

  if (!promptData || !promptData.is_public) {
    notFound();
  }

  const isAudioPrompt =
    promptData.type === 'audio' ||
    promptData.type === 'music' ||
    promptData.category === 'Music' ||
    promptData.category === 'music';

  const affiliate = await pickAffiliateForCategoryServer(promptData.category);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isFavorite = user
    ? await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptData.id)
        .single()
        .then(({ data }) => !!data)
    : false;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const promptUrl = buildPromptUrl(baseUrl, promptData);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: promptData.title || 'AI Prompt',
    description: promptData.prompt || '',
    creator: {
      '@type': 'Person',
      name: 'On Point Prompt Community',
    },
    dateCreated: promptData.created_at,
    keywords: promptData.tags?.join(', ') || promptData.category || '',
    url: promptUrl,
    ...(promptData.example_url && {
      image: promptData.example_url,
    }),
  };

  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse',
        item: `${baseUrl}/browse`,
      },
      ...(promptData.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: promptData.category,
              item: `${baseUrl}/browse?category=${encodeURIComponent(
                (promptData.category || '').toLowerCase()
              )}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: promptData.category ? 4 : 3,
        name: promptData.title || 'Prompt',
        item: promptUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden className="opacity-60">
                ›
              </li>
              <li>
                <Link href="/browse" className="hover:underline">
                  Browse
                </Link>
              </li>
              {promptData.category && (
                <>
                  <li aria-hidden className="opacity-60">
                    ›
                  </li>
                  <li>
                    <Link
                      href={`/browse?category=${encodeURIComponent(
                        (promptData.category || '').toLowerCase()
                      )}`}
                      className="hover:underline"
                    >
                      {promptData.category}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden className="opacity-60">
                ›
              </li>
              <li className="font-medium line-clamp-1 max-w-[60ch]" aria-current="page">
                {promptData.title || 'Prompt'}
              </li>
            </ol>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            {promptData.category && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {promptData.category}
              </span>
            )}
            {promptData.type && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                {promptData.type}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{promptData.title || 'Untitled Prompt'}</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">Prompt</h2>
            <div className="flex gap-2">
              <CopyButton promptText={promptData.prompt || ''} />
              {user && <FavoriteButton promptId={promptData.id} isFavorite={isFavorite} />}
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{promptData.prompt}</p>
          <div className="mt-4">
            <AffiliateCTA
              affiliate={affiliate}
              category={promptData.category}
              meta={{ prompt_id: promptData.id }}
            />
          </div>
        </div>

        {isAudioPrompt && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-3xl">🎧</span>
                Audio Preview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generated via Soundswoop / Mubert AI
              </p>
            </div>
            <MusicPreviewSection
              audioUrl={
                promptData.audio_preview_url || promptData.audio_url || promptData.example_url
              }
              promptText={promptData.prompt || ''}
            />
          </div>
        )}

        {!isAudioPrompt && promptData.example_url && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Example Result</h2>
            {promptData.type === 'image' || /^https?:/i.test(promptData.example_url || '') ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                {/^https?:/i.test(promptData.example_url || '') ? (
                  <Image
                    src={promptData.example_url}
                    alt={promptData.title || 'Example output'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="text-center p-4">
                      <div className="text-3xl mb-1">🖼️</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Image unavailable</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {promptData.example_url}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            {!isAudioPrompt && promptData.model && (
              <>
                <dt className="font-semibold">Model</dt>
                <dd className="text-gray-600 dark:text-gray-400">{promptData.model}</dd>
              </>
            )}
            {promptData.tags && promptData.tags.length > 0 && (
              <>
                <dt className="font-semibold">Tags</dt>
                <dd>
                  <div className="flex flex-wrap gap-2">
                    {promptData.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </dd>
              </>
            )}
            <dt className="font-semibold">Created</dt>
            <dd className="text-gray-600 dark:text-gray-400">
              {new Date(promptData.created_at).toLocaleDateString()}
            </dd>
          </dl>
        </div>
      </div>
    </>
  );
}
