'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';

export default function SignInClient() {
  const router = useRouter();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.onpointprompt.com');

  useEffect(() => {
    // Only redirect if we're actually on the sign-in page
    // Guard against running on other pages (e.g., prompt detail pages)
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.includes('/sign-in')) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && window.location.pathname.includes('/sign-in')) {
        router.push('/');
        router.refresh();
      }
    });
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-sm">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          providers={['google']}
          redirectTo={`${siteUrl}/auth/callback`}
          magicLink
          showLinks={false}
          theme="default"
        />
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-gray-400 dark:text-gray-300 hover:text-blue-400 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
