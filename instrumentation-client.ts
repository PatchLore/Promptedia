import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

if (!posthogKey || posthogKey === '' || posthogKey === 'phc_xxx') {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ PostHog: API key not configured. Please add NEXT_PUBLIC_POSTHOG_KEY to .env.local')
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: true,
    capture_pageview: false, // We'll handle manually for App Router
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ PostHog initialized via instrumentation', { host: posthogHost })
      }
    },
  })
}

