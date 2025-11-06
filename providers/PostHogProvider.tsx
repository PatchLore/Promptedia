'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * PostHogProvider - Initializes PostHog analytics
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

    if (!key || key === '' || key === 'phc_xxx') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ PostHog: API key not configured. Please add NEXT_PUBLIC_POSTHOG_KEY to .env.local');
      }
      return;
    }

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: host,
        autocapture: true,
        capture_pageview: false, // We'll handle manually for App Router
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ PostHog initialized', { host });
            // Test event to verify connection
            posthog.capture('test_event', { source: 'posthog_provider_init' });
            console.log('📊 Test event sent');
          }
        },
      });
    }
  }, []);

  return <>{children}</>;
}


