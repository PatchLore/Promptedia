'use client';

import posthog from 'posthog-js';
import { AffiliateTool } from '@/lib/monetization';

type Props = {
  tool: AffiliateTool;
  small?: boolean;
  meta?: Record<string, any>;
};

export default function AffiliateCTA({ tool, small, meta }: Props) {
  return (
    <div className={small ? 'mt-3' : 'mt-4'}>
      <button
        type="button"
        className={`inline-flex items-center gap-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 ${
          small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
        } hover:scale-105 transition`}
        onClick={(e) => {
          e.stopPropagation();
          if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.capture('tool_clicked', {
              tool_name: tool.name,
              tool_url: tool.url,
              location: small ? 'card' : 'detail',
              ...(meta || {}),
            });
          }
          if (typeof window !== 'undefined') {
            window.open(tool.url, '_blank', 'noopener,noreferrer');
          }
        }}
        aria-label={`Generate with ${tool.name}`}
      >
        <span className="text-lg leading-none">{tool.logo || '✨'}</span>
        <span className="font-medium">Generate with {tool.name}</span>
        <span className="opacity-90 text-xs hidden sm:inline">{tool.description}</span>
      </button>
    </div>
  );
}


