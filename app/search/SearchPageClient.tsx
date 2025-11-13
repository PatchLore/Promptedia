'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { rankPrompts, PromptDocument, sortByTrending } from '@/lib/semanticSearch';
import LazyGlobalSearch from '@/components/LazyGlobalSearch';
import { PromptGridSkeleton } from '@/components/LazyPromptGrid';
import { supabase } from '@/lib/supabase/client';

const PromptGrid = dynamic(() => import('@/components/PromptGrid'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

type SearchPageClientProps = {
  initialQuery?: string;
};

type ApiResponse = {
  prompts: PromptDocument[];
};

type PromptCollection = {
  id: string;
  name: string | null;
  description: string | null;
  created_at: string | null;
};

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  return res.json();
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function SearchPageClient({ initialQuery = '' }: SearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(() => new Set());
  const [collections, setCollections] = useState<PromptCollection[]>([]);
  const [collectionMembership, setCollectionMembership] = useState<Map<string, Set<string>>>(() => new Map());
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);
  const [collectionsModalLoading, setCollectionsModalLoading] = useState(false);

  const isAuthenticatedUser = Boolean(userId && accessToken);

  const formatCollectionDate = (value: string | null) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  };

  const currentCollectionMembership = useMemo(() => {
    if (!activePromptId) {
      return new Set<string>();
    }
    return collectionMembership.get(activePromptId) ?? new Set<string>();
  }, [activePromptId, collectionMembership]);

  useEffect(() => {
    let isActive = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isActive) return;
      setUserId(data.session?.user?.id ?? null);
      setAccessToken(data.session?.access_token ?? null);
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;
      setUserId(session?.user?.id ?? null);
      setAccessToken(session?.access_token ?? null);
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setSavedPromptIds(new Set());
      return;
    }

    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from('saved_prompts')
        .select('prompt_id')
        .eq('user_id', userId);

      if (cancelled) return;

      if (error) {
        console.error('Failed to load saved prompts for search view', error);
        setSavedPromptIds(new Set());
        return;
      }

      const ids = (data ?? [])
        .map((item) => item.prompt_id)
        .filter((value): value is string => typeof value === 'string');
      setSavedPromptIds(new Set(ids));
    };

    fetchSaved();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setCollections([]);
      setCollectionMembership(new Map());
      return;
    }

    const fetchCollections = async () => {
      const { data, error } = await supabase
        .from('prompt_collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.warn('Failed to load collections', error);
        setCollections([]);
        return;
      }

      setCollections((data as PromptCollection[]) ?? []);
    };

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleToggleSave = useCallback(
    async (promptId: string, shouldSave: boolean) => {
      if (!promptId || !userId || !accessToken) {
        return;
      }

      const previous = new Set(savedPromptIds);
      setSavedPromptIds((prev) => {
        const next = new Set(prev);
        if (shouldSave) {
          next.add(promptId);
        } else {
          next.delete(promptId);
        }
        return next;
      });

      const endpoint = shouldSave ? '/api/saved-prompts/create' : '/api/saved-prompts/delete';
      const method = shouldSave ? 'POST' : 'DELETE';

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ prompt_id: promptId }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

      } catch (error) {
        console.warn('Failed to toggle saved prompt', error);
        setSavedPromptIds(previous);
      }
    },
    [accessToken, savedPromptIds, userId],
  );

  const openCollectionsModal = useCallback(
    async (promptId: string) => {
      if (!isAuthenticatedUser) {
        console.warn('You must be signed in to manage collections.');
        return;
      }

      setActivePromptId(promptId);
      setIsCollectionsModalOpen(true);

      if (collectionMembership.has(promptId)) {
        return;
      }

      setCollectionsModalLoading(true);
      const { data, error } = await supabase
        .from('prompt_collection_items')
        .select('collection_id')
        .eq('prompt_id', promptId);

      if (error) {
        console.warn('Failed to load collection memberships', error);
      } else {
        const ids = (data ?? [])
          .map((row) => row.collection_id)
          .filter((value): value is string => typeof value === 'string');
        setCollectionMembership((prev) => {
          const next = new Map(prev);
          next.set(promptId, new Set(ids));
          return next;
        });
      }
      setCollectionsModalLoading(false);
    },
    [collectionMembership, isAuthenticatedUser],
  );

  const closeCollectionsModal = useCallback(() => {
    setIsCollectionsModalOpen(false);
    setActivePromptId(null);
    setCollectionsModalLoading(false);
  }, []);

  const handleCollectionToggle = useCallback(
    async (collectionId: string, shouldAdd: boolean) => {
      if (!activePromptId || !isAuthenticatedUser) {
        return;
      }

      const previous = collectionMembership.get(activePromptId);
      const previousSet = new Set(previous ?? []);

      setCollectionMembership((prev) => {
        const next = new Map(prev);
        const updated = new Set(prev.get(activePromptId) ?? []);
        if (shouldAdd) {
          updated.add(collectionId);
        } else {
          updated.delete(collectionId);
        }
        next.set(activePromptId, updated);
        return next;
      });

      try {
        if (shouldAdd) {
          const { error } = await supabase
            .from('prompt_collection_items')
            .insert({
              collection_id: collectionId,
              prompt_id: activePromptId,
            })
            .select('collection_id')
            .maybeSingle();

          if (error && error.code !== '23505') {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from('prompt_collection_items')
            .delete()
            .eq('collection_id', collectionId)
            .eq('prompt_id', activePromptId);

          if (error) {
            throw error;
          }
        }
      } catch (error) {
        console.warn('Failed to update collection membership', error);
        setCollectionMembership((prev) => {
          const next = new Map(prev);
          next.set(activePromptId, previousSet);
          return next;
        });
      }
    },
    [activePromptId, collectionMembership, isAuthenticatedUser],
  );

  const apiKey = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) return null;
    const params = new URLSearchParams({ limit: '200', q: trimmed });
    return `/api/search?${params.toString()}`;
  }, [debouncedQuery]);

  const { data, isLoading, error } = useSWR(apiKey, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const ranked = useMemo(() => {
    if (!data) return [];
    if (debouncedQuery.trim().length < 2) {
      return sortByTrending(data.prompts ?? []);
    }
    // Results are already ranked by the API, just return them
    return data.prompts ?? [];
  }, [data, debouncedQuery]);

  const showGrid = debouncedQuery.trim().length >= 2;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search the Prompt Library</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Discover prompts across art, music, writing, coding, and business. Results update with semantic-style
            ranking as you type.
          </p>
        </div>
        <LazyGlobalSearch initialQuery={initialQuery} />
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Refine results
            </label>
            <input
              id="search-term"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type at least two characters..."
              className="mt-1 w-full sm:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-500 transition"
            />
          </div>
          {showGrid && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Ranking results…' : `${ranked.length} matches`}
            </p>
          )}
        </div>

        {!showGrid && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
            Start typing above to explore semantic search results.
          </div>
        )}

        {showGrid && (
          <>
            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-300">
                Unable to load search results right now. Please try again shortly.
              </div>
            )}
            {isLoading && <PromptGridSkeleton />}
            {!isLoading && ranked.length === 0 && !error && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-8 text-center text-gray-500 dark:text-gray-400">
                No prompts found. Adjust your keywords or try a different phrase.
              </div>
            )}
            {!isLoading && ranked.length > 0 && (
              <PromptGrid
                prompts={ranked}
                savedPromptIds={Array.from(savedPromptIds)}
                onToggleSave={handleToggleSave}
                onOpenCollections={openCollectionsModal}
                isAuthenticated={isAuthenticatedUser}
              />
            )}
          </>
        )}
      </section>

      {isCollectionsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeCollectionsModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Select Collection</h2>
              <button
                type="button"
                onClick={closeCollectionsModal}
                className="text-neutral-400 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            {collectionsModalLoading ? (
              <p className="text-sm text-neutral-400">Loading collections...</p>
            ) : collections.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No collections yet. Create one to organize your prompts.
              </p>
            ) : (
              <ul className="space-y-3">
                {collections.map((collection) => {
                  const inCollection = currentCollectionMembership.has(collection.id);
                  return (
                    <li
                      key={collection.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {collection.name ?? 'Untitled Collection'}
                        </p>
                        {collection.created_at && (
                          <p className="text-xs text-neutral-500">
                            Created {formatCollectionDate(collection.created_at)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCollectionToggle(collection.id, !inCollection)}
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                          inCollection ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {inCollection ? 'Remove' : 'Add'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={closeCollectionsModal}
              className="mt-4 w-full rounded-lg border border-neutral-700 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


