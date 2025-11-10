'use client';

import dynamic from 'next/dynamic';
import useSWR from 'swr';
import type { PromptRow } from '@/lib/supabase/client';

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
  loading: () => <PromptGridSkeleton />,
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
    return <PromptGridSkeleton />;
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

function PromptGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
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

