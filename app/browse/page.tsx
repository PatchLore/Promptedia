import { createClient } from '@/lib/supabase/server';
import BrowseClient from '@/components/BrowseClient';
import PromptCardSkeleton from '@/components/PromptCardSkeleton';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Prompts - On Point Prompt',
  description: 'Search and filter AI prompts by category, type, and keywords',
};

// Force dynamic rendering to ensure searchParams are fresh
export const dynamic = 'force-dynamic';

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Art', slug: 'art' },
  { name: 'Music', slug: 'music' },
  { name: 'Writing', slug: 'writing' },
  { name: 'Business', slug: 'business' },
  { name: 'Coding', slug: 'coding' },
];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const [supabase, params] = await Promise.all([
    createClient(),
    searchParams,
  ]);
  const search = params.search || '';
  const category = params.category || 'all';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

  // Build the base query
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('is_public', true)
    .eq('is_pro', false);

  // Apply category filter (case-insensitive)
  if (category !== 'all') {
    // Capitalize first letter to match database format
    const categoryFilter = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    query = query.eq('category', categoryFilter);
  }

  // Client-side fuzzy search will handle `search`, but we can leave server unfiltered to allow fuzzy
  const { data: prompts, error } = await query.order('created_at', { ascending: false });

  // Log for debugging (remove in production)
  if (error) {
    console.error('Supabase query error:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Prompts</h1>
      {/* Upsell banner */}
      <div className="mb-6">
        <a
          href="/packs"
          className="block w-full text-center px-4 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition"
        >
          💡 Want all 100+ prompts in one pack? → Get the Creator Bundle
        </a>
      </div>
      {/* ItemList JSON-LD for list/categorized pages */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: category === 'all' ? 'All Prompts' : `${category} Prompts`,
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            numberOfItems: (prompts || []).length,
            itemListElement: (prompts || []).map((p: any, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `${baseUrl}/prompt/${p.id}`,
              name: p.title || 'Prompt',
              ...(p.example_url ? { image: p.example_url } : {}),
            })),
          }),
        }}
      />
      <Suspense fallback={
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <BrowseClient categories={categories} prompts={prompts || []} />
      </Suspense>
    </div>
  );
}
