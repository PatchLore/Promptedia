'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type TagFilterProps = {
  categories: { name: string; slug: string }[];
  currentCategory: string;
};

export default function TagFilter({ categories, currentCategory }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current category from URL params directly
  const activeCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Preserve search query if it exists
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.slug;
        return (
          <button
            key={category.slug}
            onClick={() => handleCategoryChange(category.slug)}
            disabled={isPending}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
