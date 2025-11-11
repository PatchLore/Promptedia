'use client';

import dynamic from 'next/dynamic';

const LazyGlobalSearch = dynamic(() => import('./GlobalSearch'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-11 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 animate-pulse" />
  ),
});

export default LazyGlobalSearch;


