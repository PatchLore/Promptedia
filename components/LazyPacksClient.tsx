'use client';

import dynamic from 'next/dynamic';

const PacksClient = dynamic(() => import('./PacksClient'), {
  ssr: false,
  loading: () => <PacksClientSkeleton />,
});

export default function LazyPacksClient() {
  return <PacksClient />;
}

export function PacksClientSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 p-6 animate-pulse space-y-4"
        >
          <div className="h-6 w-2/3 rounded bg-gray-800/60" />
          <div className="h-4 w-full rounded bg-gray-800/40" />
          <div className="h-4 w-5/6 rounded bg-gray-800/30" />
          <div className="h-8 w-1/2 rounded bg-gray-800/50" />
        </div>
      ))}
    </div>
  );
}

