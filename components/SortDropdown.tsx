'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function SortDropdown() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'popular';

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') params.delete('sort');
    else params.set('sort', value);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <select
      value={sort}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    >
      <option value="newest">Newest</option>
      <option value="popular">Popular</option>
    </select>
  );
}


