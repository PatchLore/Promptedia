'use client';

import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./ProfileClient'), {
  ssr: false,
  loading: () => <ProfileClientSkeleton />,
});

type LazyProfileClientProps = {
  promptIds: string[];
};

export default function LazyProfileClient(props: LazyProfileClientProps) {
  return <ClientComponent {...props} />;
}

export function ProfileClientSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
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

