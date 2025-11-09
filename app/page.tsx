export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase/client';
import PromptGrid from '@/components/PromptGrid';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

const categories = [
  { name: 'Art', slug: 'art', icon: '🎨' },
  { name: 'Music', slug: 'music', icon: '🎵' },
  { name: 'Writing', slug: 'writing', icon: '✍️' },
  { name: 'Business', slug: 'business', icon: '💼' },
  { name: 'Coding', slug: 'coding', icon: '💻' },
];

export default async function HomePage() {
  const { data: featuredPrompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('created_at', { ascending: false })
    .limit(12);

  const content = (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          On Point Prompt
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Discover, search, and save AI prompts for image generation, music creation, writing, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/browse"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse Prompts
          </Link>
          <Link
            href="/create"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Submit Prompt
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/browse?category=${category.slug}`}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold">{category.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Prompts</h2>
          <Link
            href="/browse"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All →
          </Link>
        </div>
        <PromptGrid prompts={featuredPrompts || []} />
      </section>
    </div>
  );

  return (
    <PostHogProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{content}</main>
          <Footer />
        </div>
      </ToastProvider>
    </PostHogProvider>
  );
}



