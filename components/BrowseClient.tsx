'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PromptGrid from './PromptGrid';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import SortDropdown from './SortDropdown';
import TagChips from './TagChips';

type BrowseClientProps = {
  prompts: any[];
  categories: { name: string; slug: string }[];
};

function normalize(text: string) {
  return text.toLowerCase();
}

function fuzzyMatch(haystack: string, needle: string) {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return true;
  if (h.includes(n)) return true;
  // simple subsequence match
  let i = 0;
  for (let c of h) {
    if (c === n[i]) i++;
    if (i === n.length) return true;
  }
  return false;
}

export default function BrowseClient({ prompts, categories }: BrowseClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const tagsParam = searchParams.get('tags') || '';
  const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'popular';
  const activeTags = tagsParam
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const filtered = useMemo(() => {
    let list = prompts.slice();

    // category filter is already applied server-side, but also guard on client for URL sharing
    if (category !== 'all') {
      const catNorm = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      list = list.filter((p) => (p.category || '') === catNorm);
    }

    // tag filter (intersection: require all selected tags)
    if (activeTags.length > 0) {
      list = list.filter((p) => {
        const pTags: string[] = Array.isArray(p.tags) ? p.tags : [];
        const pSet = new Set(pTags.map((t) => t.toLowerCase()));
        return activeTags.every((t) => pSet.has(t.toLowerCase()));
      });
    }

    // fuzzy search by title/prompt
    if (search) {
      list = list.filter((p) => {
        const title = p.title || '';
        const body = p.prompt || '';
        return fuzzyMatch(title, search) || fuzzyMatch(body, search);
      });
    }

    // sort
    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'popular') {
      // Prefer favorite_count if present; fallback to newest
      const hasCounts = list.some((p) => typeof (p as any).favorite_count === 'number');
      if (hasCounts) {
        list.sort((a: any, b: any) => (b.favorite_count || 0) - (a.favorite_count || 0));
      } else {
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }

    return list;
  }, [prompts, category, activeTags, search, sort]);

  // expose a clear filters action
  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['search', 'category', 'tags', 'sort'].forEach((k) => params.delete(k));
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchBar />
        </div>
        <div className="w-full md:w-56">
          <SortDropdown />
        </div>
      </div>

      <TagFilter categories={categories} currentCategory={category} />

      <TagChips />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400 dark:text-gray-300">{filtered.length} results</p>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm w-full sm:w-auto"
        >
          Clear filters
        </button>
      </div>

      {isMounted ? (
        <PromptGrid prompts={filtered} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-xl bg-gray-800/50 h-48" />
          ))}
        </div>
      )}
    </div>
  );
}


