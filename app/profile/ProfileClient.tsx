'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import type { PromptRow } from '@/lib/supabase/client';

interface ProfileClientProps {
  promptIds: string[];
}

// Lazy-load PromptGrid to avoid shipping the entire favorites grid on initial render.
const PromptGrid = dynamic(() => import('@/components/PromptGrid'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

export default function ProfileClient({ promptIds }: ProfileClientProps) {
  const fetchKey = useMemo(() => {
    if (promptIds.length === 0) {
      return null;
    }
    const query = encodeURIComponent(promptIds.join(','));
    return `/api/prompts?ids=${query}&includePrivate=true`;
  }, [promptIds]);

  const fetcher = (url: string) =>
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load favorites: ${response.statusText}`);
      }
      return response.json() as Promise<{ prompts: PromptRow[] }>;
    });

  const { data, isLoading, error } = useSWR(fetchKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
    fallbackData: { prompts: [] },
    keepPreviousData: true,
  });

  if (isLoading) {
    return <PromptGridSkeleton />;
  }

  if (error) {
    console.error('Error loading favorite prompts:', error);
  }

  const prompts = data?.prompts ?? [];

  if (prompts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
          You haven&apos;t saved any favorites yet. Start browsing prompts and save the ones you like!
        </p>
      </div>
    );
  }

  return <PromptGrid prompts={prompts} />;
}

function PromptGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40"
        >
          <div className="animate-pulse bg-gray-800/60 aspect-[16/9]" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 rounded bg-gray-800/60" />
            <div className="h-4 w-full rounded bg-gray-800/40" />
            <div className="h-4 w-5/6 rounded bg-gray-800/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
