'use client';

import Link from 'next/link';
import { PromptPack } from '@/lib/monetization';
import posthog from 'posthog-js';
import { getImageUrl } from '@/lib/getImageUrl';

type PackCardProps = {
  pack: PromptPack | {
    id?: string;
    slug: string;
    title: string;
    summary: string;
    price: string;
    url: string;
    image_url?: string | null;
  };
};

export default function PackCard({ pack }: PackCardProps) {
  // Determine if this is an external URL or internal pack detail page
  const isExternalUrl = pack.url && (pack.url.startsWith('http://') || pack.url.startsWith('https://'));
  const cardHref = isExternalUrl ? pack.url : `/packs/${pack.slug}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 ease-out hover:scale-105 overflow-hidden h-full flex flex-col">
      {/* Pack Image */}
      <div className="w-full aspect-video overflow-hidden">
        <img
          src={getImageUrl(pack.image_url)}
          alt={pack.title}
          className="w-full h-full object-cover rounded-t-2xl shadow-sm"
        />
      </div>

      <Link
        href={cardHref}
        {...(isExternalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="p-5 flex flex-col gap-3 flex-grow"
        onClick={() => {
          if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.capture('pack_clicked', {
              pack_slug: pack.slug,
              pack_title: pack.title,
              is_external: isExternalUrl,
            });
          }
        }}
      >
        <h3 className="text-lg font-semibold line-clamp-2">{pack.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{pack.summary}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold">{pack.price}</span>
          <span className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition inline-block">
            {isExternalUrl ? 'Buy' : 'View Pack'}
          </span>
        </div>
      </Link>
    </div>
  );
}


