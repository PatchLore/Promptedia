'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Simple tag cloud built from current URL state + optional preset list in future
export default function TagChips() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tagsParam = searchParams.get('tags') || '';
  const activeTags = useMemo(
    () => tagsParam.split(',').map((t) => t.trim()).filter(Boolean),
    [tagsParam]
  );

  // For now, show only active tags with ability to remove; in future we can surface popular tags
  const removeTag = (tag: string) => {
    const set = new Set(activeTags);
    set.delete(tag);
    const next = Array.from(set).join(',');
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('tags', next);
    else params.delete('tags');
    router.push(`/browse?${params.toString()}`);
  };

  if (activeTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          #{tag}
          <button
            aria-label={`Remove tag ${tag}`}
            onClick={() => removeTag(tag)}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}


