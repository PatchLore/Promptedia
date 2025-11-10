'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const PromptGrid = dynamic(() => import('./PromptGrid'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

export type LazyPromptGridProps = ComponentProps<typeof PromptGrid>;

export default function LazyPromptGrid(props: LazyPromptGridProps) {
  return <PromptGrid {...props} />;
}

export function PromptGridSkeleton({ items = 6 }: { items?: number } = {}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40"
        >
          <div className="animate-pulse bg-gray-800/60 aspect-[16/9]" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 rounded bg-gray-800/60" />
            <div className="h-4 w-full rounded bg-gray-800/40" />
            <div className="h-4 w-5/6 rounded bg-gray-800/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

