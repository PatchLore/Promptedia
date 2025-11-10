'use client';

import dynamic from 'next/dynamic';
import type { BrowseClientProps } from './BrowseClient';
import { PromptGridSkeleton } from './LazyPromptGrid';

const BrowseClient = dynamic(() => import('./BrowseClient'), {
  ssr: false,
  loading: () => <PromptGridSkeleton />,
});

export default function LazyBrowseClient(props: BrowseClientProps) {
  return <BrowseClient {...props} />;
}

