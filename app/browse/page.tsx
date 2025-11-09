import { supabase } from '@/lib/supabase/client';
import BrowseClient from '@/components/BrowseClient';
import PromptCardSkeleton from '@/components/PromptCardSkeleton';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { buildPromptUrl } from '@/lib/slug';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export const metadata: Metadata = {
  title: 'Browse Prompts - On Point Prompt',
  description: 'Search and filter AI prompts by category, type, and keywords',
};

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
  searchParams?: { search?: string; category?: string };
}) {
  const search = searchParams?.search ?? '';
  const category = searchParams?.category ?? 'all';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

  let query = supabase
    .from('prompts')
    .select('*')
    .eq('is_public', true)
    .eq('is_pro', false);

  if (category !== 'all') {
    const categoryFilter = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    query = query.eq('category', categoryFilter);
  }

  const { data: prompts, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase query error:', error);
  }

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Prompts</h1>

      <div className="mb-6">
        <a
          href="/packs"
          className="block w-full text-center px-4 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition"
        >
          💡 Want all 100+ prompts in one pack? → Get the Creator Bundle
        </a>
      </div>

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
              url: buildPromptUrl(baseUrl, p),
              name: p.title || 'Prompt',
              ...(p.example_url ? { image: p.example_url } : {}),
            })),
          }),
        }}
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <PromptCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <BrowseClient categories={categories} prompts={prompts || []} />
      </Suspense>
    </div>
  );

  return (
    <PostHogProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{content}</main>
          <Footer />
        </div>
      </ToastProvider>
    </PostHogProvider>
  );
}
