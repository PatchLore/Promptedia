'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export default function WrapperClient({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ToastProvider>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </PostHogProvider>
  );
}
