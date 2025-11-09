'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const viewport = {
  themeColor: '#000000',
};

export default function NotFound() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading…</div>}>
      <NotFoundInner />
    </Suspense>
  );
}

function NotFoundInner() {
  const params = useSearchParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8 text-center">
      <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you’re looking for doesn’t exist.</p>

      <Link
        href="/"
        className="px-6 py-3 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}



