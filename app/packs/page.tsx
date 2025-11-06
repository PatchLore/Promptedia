import { promptPacks } from '@/lib/monetization';
import PackCard from '@/components/PackCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Packs — On Point Prompt',
  description: 'Curated digital downloads of themed AI prompts for creators, musicians, and artists.',
};

export default function PacksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Prompt Packs</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
        Download curated packs of AI prompts to kickstart your next project.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promptPacks.map((pack) => (
          <PackCard key={pack.slug} pack={pack} />
        ))}
      </div>
    </div>
  );
}


