'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export default function WrapperClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
    console.log('[WrapperClient] Mounted', { pathname });
    return () => {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
      console.log('[WrapperClient] Unmounted', { pathname });
    };
  }, []);

  return (
    <PostHogProvider>
      <ToastProvider>
        <Navbar />
        <main className="flex-grow pb-20">
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </PostHogProvider>
  );
}
