'use client';

import { useCallback, useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PromptDocument } from '@/lib/semanticSearch';
import { buildPromptPath } from '@/lib/slug';

type CategoryFilter = {
  label: string;
  value: string;
};

type GlobalSearchProps = {
  initialQuery?: string;
  categories?: CategoryFilter[];
  limit?: number;
};

type ApiResponse = {
  prompts: PromptDocument[];
};

const DEFAULT_CATEGORIES: CategoryFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'Art', value: 'Art' },
  { label: 'Music', value: 'Music' },
  { label: 'Writing', value: 'Writing' },
  { label: 'Coding', value: 'Coding' },
  { label: 'Business', value: 'Business' },
];

const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Search request failed');
  }
  return response.json();
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Highlights matching terms in text
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function GlobalSearch({
  initialQuery = '',
  categories = DEFAULT_CATEGORIES,
  limit = 8,
}: GlobalSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 250);

  const apiKey = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) return null;
    const params = new URLSearchParams();
    params.set('limit', String(limit * 2)); // Fetch more for client-side category filtering
    params.set('q', trimmed);
    return `/api/search?${params.toString()}`;
  }, [debouncedQuery, limit]);

  const { data, isLoading, error } = useSWR(apiKey, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const rankedPrompts = useMemo(() => {
    if (!data || !apiKey) return [];
    let prompts = data.prompts ?? [];
    
    // Filter by category if selected
    if (selectedCategory !== 'all') {
      prompts = prompts.filter((p) => p.category === selectedCategory);
    }
    
    return prompts.slice(0, limit);
  }, [data, selectedCategory, limit, apiKey]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && query.trim().length >= 2) {
        event.preventDefault();
        setIsFocused(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (event.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [query, router]
  );

  const shouldShowOverlay = Boolean(
    isFocused && debouncedQuery.trim().length >= 2 && (isLoading || rankedPrompts.length > 0 || error),
  );

  const handleDocumentClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;
    if (!containerRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isFocused, handleDocumentClick]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search prompts, packs, and tags..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-500 transition"
          aria-label="Global search input"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
          aria-label="Filter search by category"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {shouldShowOverlay && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Searching…</div>
            )}

            {error && (
              <div className="p-4 text-sm text-red-500 dark:text-red-400">
                Something went wrong while searching.
              </div>
            )}

            {!isLoading && !error && rankedPrompts.length === 0 && debouncedQuery.trim().length >= 2 && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                No results found. Try different keywords or check spelling.
              </div>
            )}

            {!isLoading &&
              rankedPrompts.length > 0 && (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rankedPrompts.map((prompt, index) => {
                    const promptId = prompt.id ?? prompt.slug ?? '';
                    const path = promptId
                      ? buildPromptPath({ id: promptId, slug: prompt.slug ?? undefined })
                      : '#';
                    const listKey = prompt.id ?? prompt.slug ?? `prompt-${index}`;
                    const title = prompt.title ?? 'Untitled prompt';
                    return (
                      <li key={listKey}>
                        <Link
                          href={path}
                          className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          onClick={() => setIsFocused(false)}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {highlightText(title, debouncedQuery.trim())}
                          </span>
                          <span className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            {prompt.category ?? 'General'}
                          </span>
                          {prompt.description && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                              {highlightText(prompt.description, debouncedQuery.trim())}
                            </span>
                          )}
                          {prompt.tags && prompt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {prompt.tags.slice(0, 3).map((tag) => {
                                const tagStr = String(tag);
                                return (
                                  <span
                                    key={tagStr}
                                    className="px-2 py-1 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded-full"
                                  >
                                    #{tagStr}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              onClick={() => setIsFocused(false)}
            >
              View all results
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


