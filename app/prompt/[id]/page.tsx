import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCTA from '@/components/AffiliateCTA';
import { pickAffiliateForCategoryServer } from '@/lib/affiliate-server';
import { CopyButton, FavoriteButton } from '@/components/PromptActions';
import MusicPreviewSection from '@/components/MusicPreviewSection';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (!prompt) {
    return {
      title: 'Prompt Not Found',
    };
  }

  const promptData = prompt as any;

  return {
    title: `${promptData.title || 'Prompt'} - Promptopedia`,
    description: promptData.prompt?.substring(0, 160) || 'AI prompt from Promptopedia',
    openGraph: {
      title: promptData.title || 'Prompt',
      description: promptData.prompt?.substring(0, 160) || '',
      images: promptData.example_url ? [promptData.example_url] : [],
    },
  };
}

export default async function PromptPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (!prompt || !(prompt as any).is_public) {
    notFound();
  }

  const promptData = prompt as any;

  // Fetch affiliate for this category
  const affiliate = await pickAffiliateForCategoryServer(promptData.category);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isFavorite = user
    ? await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', id)
        .single()
        .then(({ data }) => !!data)
    : false;

  // Structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: promptData.title || 'AI Prompt',
    description: promptData.prompt || '',
    creator: {
      '@type': 'Person',
      name: 'Promptopedia Community',
    },
    dateCreated: promptData.created_at,
    keywords: promptData.tags?.join(', ') || promptData.category || '',
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
              item: `${baseUrl}/browse?category=${encodeURIComponent((promptData.category || '').toLowerCase())}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: promptData.category ? 4 : 3,
        name: promptData.title || 'Prompt',
        item: `${baseUrl}/prompt/${id}`,
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
          {/* Visible breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li aria-hidden className="opacity-60">›</li>
              <li>
                <Link href="/browse" className="hover:underline">Browse</Link>
              </li>
              {promptData.category && (
                <>
                  <li aria-hidden className="opacity-60">›</li>
                  <li>
                    <Link href={`/browse?category=${encodeURIComponent((promptData.category || '').toLowerCase())}`} className="hover:underline">
                      {promptData.category}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden className="opacity-60">›</li>
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
              {user && <FavoriteButton promptId={id} isFavorite={isFavorite} />}
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {promptData.prompt}
          </p>
          {/* Upsell banner below description */}
          <div className="mt-4">
            <AffiliateCTA affiliate={affiliate} category={promptData.category} meta={{ prompt_id: id }} />
          </div>
        </div>

        {/* Example Result Section - handles all types including Music */}
        {(promptData.example_url || promptData.category === 'Music' || promptData.type === 'audio' || promptData.type === 'music') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Example Result</h2>
            {promptData.type === 'image' || (promptData.category !== 'Music' && promptData.type !== 'audio' && promptData.type !== 'music' && promptData.example_url) ? (
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
            ) : (promptData.category === 'Music' || promptData.type === 'audio' || promptData.type === 'music') ? (
              <MusicPreviewSection 
                audioUrl={promptData.audio_url || promptData.example_url}
                promptText={promptData.prompt || ''}
              />
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
            {promptData.model && (
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
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                      >
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
