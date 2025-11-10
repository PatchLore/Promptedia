'use client';

import { promptPacks } from '@/lib/monetization';
import PackCard from '@/components/PackCard';

// Lightweight grid for pack cards; rendered dynamically from the parent to keep the initial bundle minimal.

export default function PacksClient() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {promptPacks.map((pack) => (
        <PackCard key={pack.slug} pack={pack} />
      ))}
    </div>
  );
}
