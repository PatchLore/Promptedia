'use client';

import { useMemo } from 'react';
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
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1"><SearchBar /></div>
        <div className="w-full md:w-56"><SortDropdown /></div>
      </div>

      <TagFilter categories={categories} currentCategory={category} />

      <TagChips />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">{filtered.length} results</p>
        <button onClick={clearAll} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear all</button>
      </div>

      <PromptGrid prompts={filtered} />
    </div>
  );
}


