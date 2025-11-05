import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';
import PostHogPageview from '@/components/PostHogPageview';

export const metadata: Metadata = {
  title: 'Promptopedia — Discover AI Prompts & Inspiration',
  description:
    'Browse 100+ AI prompts for ChatGPT, Midjourney, and music generation. Search by category and discover inspiration daily.',
  keywords: ['AI prompts', 'prompt library', 'AI art', 'image generation', 'AI music', 'ChatGPT prompts', 'Midjourney prompts'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Promptopedia — Discover AI Prompts & Inspiration',
    description:
      'Browse 100+ AI prompts for ChatGPT, Midjourney, and music generation. Search by category and discover inspiration daily.',
    siteName: 'Promptopedia',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Promptopedia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@promptopedia',
    creator: '@promptopedia',
    title: 'Promptopedia — Discover AI Prompts & Inspiration',
    description:
      'Browse 100+ AI prompts for ChatGPT, Midjourney, and music generation. Search by category and discover inspiration daily.',
    images: ['/og.png'],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <PostHogProvider>
          <ToastProvider>
            <Navbar />
            <Suspense fallback={null}>
              <PostHogPageview />
            </Suspense>
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
