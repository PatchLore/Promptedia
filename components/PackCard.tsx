'use client';

import Link from 'next/link';
import { PromptPack } from '@/lib/monetization';
import posthog from 'posthog-js';

export default function PackCard({ pack }: { pack: PromptPack }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 ease-out hover:scale-105 overflow-hidden h-full flex flex-col">
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <h3 className="text-lg font-semibold line-clamp-2">{pack.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{pack.summary}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold">{pack.price}</span>
          <Link
            href={pack.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition"
            onClick={() => {
              if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
                posthog.capture('pack_clicked', {
                  pack_slug: pack.slug,
                  pack_title: pack.title,
                });
              }
            }}
          >
            Buy
          </Link>
        </div>
      </div>
    </div>
  );
}


