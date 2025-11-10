'use client';

import dynamic from 'next/dynamic';
import { PromptGridSkeleton } from '@/components/LazyPromptGrid';

const ClientComponent = dynamic(() => import('./ProfileClient'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

export default function LazyProfileClient() {
  return <ClientComponent />;
}

