import { supabase } from '@/lib/supabase/client';
import BrowseClient from '@/components/BrowseClient';
import PromptCardSkeleton from '@/components/PromptCardSkeleton';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPromptUrl } from '@/lib/slug';
import WrapperClient from '@/app/WrapperClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'Browse Prompts | On Point Prompt',
  description: 'Search and filter AI prompts by category, type, and keywords on On Point Prompt.',
  alternates: {
    canonical: `${siteUrl}/browse`,
  },
  openGraph: {
    title: 'Browse Prompts | On Point Prompt',
    description: 'Search and filter AI prompts by category, type, and keywords on On Point Prompt.',
    url: `${siteUrl}/browse`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
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

const categoryContentMap: Record<string, { title: string; intro: string }> = {
  art: {
    title: 'Art Prompts',
    intro: 'Explore AI art prompts for Midjourney, Stable Diffusion, and other image generators to spark visual creativity.',
  },
  music: {
    title: 'Music Prompts',
    intro: 'Discover AI music generation prompts for Suno, Udio, and SoundSwoop. Create melodies and soundscapes instantly.',
  },
  writing: {
    title: 'Writing Prompts',
    intro: 'Browse creative writing prompts inspired by AI storytelling to craft narratives, dialogue, and more.',
  },
  business: {
    title: 'Business Prompts',
    intro: 'Find powerful business prompts for sales scripts, marketing copy, and data-driven analysis with AI.',
  },
  coding: {
    title: 'Coding Prompts',
    intro: 'AI coding prompts for debugging, code generation, refactoring, and learning new languages faster.',
  },
};

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

  const normalizedCategory = category.toLowerCase();
  const categoryCopy = categoryContentMap[normalizedCategory];

  const content = (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">
          {categoryCopy ? categoryCopy.title : 'Browse Prompts'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {categoryCopy
            ? categoryCopy.intro
            : 'Search and filter AI prompts across every category, from art and music to business and coding.'}
        </p>
      </header>

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

  return <WrapperClient>{content}</WrapperClient>;
}
