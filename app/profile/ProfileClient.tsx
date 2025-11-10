'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';
import type { PromptRow } from '@/lib/supabase/client';
import { PromptGridSkeleton } from '@/components/LazyPromptGrid';

// Bundle note: we keep PromptGrid lazily loaded to avoid hydrating the entire favorites grid upfront.
const PromptGrid = dynamic(() => import('@/components/PromptGrid'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

const fetchFavorites = async (userId: string) => {
  const response = await fetch(`/api/favorites?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to load favorites: ${response.statusText}`);
  }
  return (await response.json()) as { promptIds: string[] };
};

const fetchPrompts = async (promptIds: string[]) => {
  if (promptIds.length === 0) {
    return { prompts: [] };
  }

  const query = encodeURIComponent(promptIds.join(','));
  const response = await fetch(`/api/prompts?ids=${query}&includePrivate=true`);
  if (!response.ok) {
    throw new Error(`Failed to load prompt details: ${response.statusText}`);
  }
  return (await response.json()) as { prompts: PromptRow[] };
};

export default function ProfileClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      if (!id) {
        router.replace('/');
      }
      setUserId(id);
      setCheckingAuth(false);
    });
  }, [router]);

  if (!checkingAuth && !userId) {
    return <PromptGridSkeleton />;
  }

  const {
    data: favoritesData,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = useSWR(userId ? ['favorites', userId] : null, () => fetchFavorites(userId!), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const promptKey = useMemo(() => {
    const ids = favoritesData?.promptIds ?? [];
    return ids.length > 0 ? ['prompts', ids.sort().join(',')] : null;
  }, [favoritesData?.promptIds]);

  const {
    data: promptsData,
    isLoading: promptsLoading,
    error: promptsError,
  } = useSWR(promptKey, () => fetchPrompts(favoritesData?.promptIds ?? []), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  if (checkingAuth || favoritesLoading || promptsLoading) {
    return <PromptGridSkeleton />;
  }

  if (favoritesError || promptsError) {
    console.error('Error loading favorite prompts:', favoritesError || promptsError);
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
          Unable to load your favorites right now. Please try again later.
        </p>
      </div>
    );
  }

  const prompts = promptsData?.prompts ?? [];

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
