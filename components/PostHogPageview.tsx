'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

export default function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Wait for PostHog to be loaded
    if (!posthog.__loaded) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ PostHog not loaded yet, skipping pageview');
      }
      return;
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 PostHog pageview captured:', url);
    }
  }, [pathname, searchParams]);

  return null;
}


