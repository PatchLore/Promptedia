import PacksClient from '@/components/PacksClient';
import WrapperClient from '@/app/WrapperClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'Prompt Packs | On Point Prompt',
  description: 'Browse premium AI prompt packs curated by On Point Prompt for creators and professionals.',
  alternates: {
    canonical: `${siteUrl}/packs`,
  },
  openGraph: {
    title: 'Prompt Packs | On Point Prompt',
    description: 'Browse premium AI prompt packs curated by On Point Prompt for creators and professionals.',
    url: `${siteUrl}/packs`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

export default function PacksPage() {
  return (
    <WrapperClient>
      <section className="max-w-3xl mx-auto mb-8 text-gray-600 dark:text-gray-400 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Premium AI Prompt Packs &amp; Creator Bundles</h2>
        <p>
          Discover AI prompt bundles tailored for image generation, music creation, and high-impact ChatGPT prompts. These AI prompt packs include
          100+ ready-to-use prompts to help creators move faster and produce consistent results across every workflow.
        </p>
        <p>
          Unlock professionally crafted prompts that save time, eliminate guesswork, and empower your next project—whether you&apos;re designing visuals,
          producing audio, or writing copy.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Save time with curated prompt bundles</li>
          <li>Download 100+ prompts instantly</li>
          <li>Boost content creation with proven prompt formulas</li>
        </ul>
      </section>
      <PacksClient />
    </WrapperClient>
  );
}


