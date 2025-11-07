import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';
import PostHogPageview from '@/components/PostHogPageview';

export const metadata: Metadata = {
  title: 'On Point Prompt — Discover AI Prompts & Inspiration',
  description:
    'Browse 100+ AI prompts for ChatGPT, Midjourney, and music generation. Search by category and discover inspiration daily.',
  keywords: ['AI prompts', 'prompt library', 'AI art', 'image generation', 'AI music', 'ChatGPT prompts', 'Midjourney prompts'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com'),
  openGraph: {
    type: 'website',
    url: '/',
    title: 'On Point Prompt — Discover AI Prompts & Inspiration',
    description:
      'Browse 100+ AI prompts for ChatGPT, Midjourney, and music generation. Search by category and discover inspiration daily.',
    siteName: 'On Point Prompt',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'On Point Prompt',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@onpointprompt',
    creator: '@onpointprompt',
    title: 'On Point Prompt — Discover AI Prompts & Inspiration',
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
        <SpeedInsights />
      </body>
    </html>
  );
}
