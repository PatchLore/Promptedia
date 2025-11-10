'use client';

import dynamic from 'next/dynamic';
import useSWR from 'swr';
import type { PromptRow } from '@/lib/supabase/client';
import { PromptGridSkeleton } from '@/components/LazyPromptGrid';

type RelatedPromptsClientProps = {
  category?: string | null;
  excludeSlug?: string | null;
};

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load related prompts: ${response.statusText}`);
    }
    return response.json() as Promise<{ prompts: PromptRow[] }>;
  });

const PromptGrid = dynamic(() => import('@/components/PromptGrid'), {
  ssr: false,
  loading: () => <PromptGridSkeleton items={3} />,
});

export default function RelatedPromptsClient({
  category,
  excludeSlug,
}: RelatedPromptsClientProps) {
  const shouldFetch = category && category.trim().length > 0;

  const searchParams = new URLSearchParams();
  if (category) searchParams.set('category', category);
  searchParams.set('limit', '3');
  if (excludeSlug) searchParams.set('exclude', excludeSlug);

  const { data, isLoading, error } = useSWR(
    shouldFetch ? `/api/prompts?${searchParams.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );

  if (!shouldFetch) {
    return null;
  }

  if (isLoading) {
    return <PromptGridSkeleton items={3} />;
  }

  if (error || !data?.prompts?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {error ? 'Unable to load related prompts right now.' : 'No related prompts available yet.'}
      </p>
    );
  }

  return <PromptGrid prompts={data.prompts} />;
}

