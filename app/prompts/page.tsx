export const dynamic = "force-dynamic";

import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import WrapperClient from '@/app/WrapperClient';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'All Prompts | On Point Prompt',
  description: 'Explore every AI prompt available on On Point Prompt, organised by category and keyword.',
  alternates: {
    canonical: `${siteUrl}/prompts`,
  },
  openGraph: {
    title: 'All Prompts | On Point Prompt',
    description: 'Explore every AI prompt available on On Point Prompt, organised by category and keyword.',
    url: `${siteUrl}/prompts`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const collectionLdJson = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'All Prompts',
  isPartOf: `${siteUrl}/prompts`,
  url: `${siteUrl}/prompts`,
};

export default async function PromptsPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string };
}) {
  const category = searchParams?.category || '';
  const search = searchParams?.q || '';

  let query = supabase
    .from('prompts')
    .select('slug, title, description, category')
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

  if (error) {
    console.error('Error fetching prompts:', error);
    return <WrapperClient><div className="container mx-auto px-4 py-10">Error loading prompts.</div></WrapperClient>;
  }

  if (!prompts?.length) {
    return <WrapperClient><div className="container mx-auto px-4 py-10">No prompts found.</div></WrapperClient>;
  }

  const content = (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLdJson) }}
      />
      <h1 className="text-4xl font-bold mb-8">All Prompts</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {['Writing', 'Art', 'Coding', 'Business', 'Music'].map((cat) => (
          <Link
            key={cat}
            href={`/prompts?category=${cat}`}
            className={`px-3 py-1 rounded-md text-sm ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </Link>
        ))}

        {category && (
          <Link
            href="/prompts"
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
          >
            Clear
          </Link>
        )}
      </div>

      <form method="get" className="mb-8">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="text"
          name="q"
          placeholder="Search prompts..."
          defaultValue={search}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <Link
            key={prompt.slug}
            href={`/prompts/${prompt.slug}`}
            className="block bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:bg-gray-900 transition shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white line-clamp-2">
              {prompt.title}
            </h2>

            {prompt.description && (
              <p className="text-gray-400 text-sm mt-3 line-clamp-3">
                {prompt.description}
              </p>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <span className="bg-gray-800 px-2 py-1 rounded-md text-gray-300">
                {prompt.category || 'Uncategorised'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return <WrapperClient>{content}</WrapperClient>;
}

