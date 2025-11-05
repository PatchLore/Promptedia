'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    if (!key) return;
    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: host,
        autocapture: true,
        capture_pageview: false, // we'll handle manually for App Router
      });
    }
  }, []);

  return <>{children}</>;
}


