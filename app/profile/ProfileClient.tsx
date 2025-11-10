'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import PromptGrid from '@/components/PromptGrid';
import type { PromptRow } from '@/lib/supabase/client';

interface ProfileClientProps {
  promptIds: string[];
}

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
    return <PromptGrid prompts={[]} isLoading skeletonCount={6} />;
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
