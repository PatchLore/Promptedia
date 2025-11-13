import type { PromptRow } from '@/lib/supabase/client';
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';
import AdminAuthCheck from '@/components/AdminAuthCheck';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/admin`;

export default async function AdminPage() {
  const supabase = getSupabaseServerClient();
  // Fetch all prompts
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, type, example_url, audio_preview_url, thumbnail_url, image_url, model, is_public, is_pro, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (process.env.NODE_ENV === 'development') {
    console.log('[DB]', 'admin_prompts', {
      results: prompts?.length ?? 0,
    });
  }

  if (error) {
    console.error('Error fetching prompts:', error);
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Admin Dashboard',
    url: canonicalUrl,
    description: 'Manage prompts, visibility, and metadata across the On Point Prompt catalog.',
  };

  const content = (
    <>
      <head>
        <title>Admin Dashboard | On Point Prompt</title>
        <meta
          name="description"
          content="Moderate and manage prompts across the On Point Prompt catalog."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Admin Dashboard | On Point Prompt" />
        <meta
          property="og:description"
          content="Moderate and manage prompts across the On Point Prompt catalog."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || 'https://placehold.co/600x400?text=Image'} />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
      </head>

      <AdminAuthCheck>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all prompts in the database
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/packs"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md"
              >
                Manage Packs
              </Link>
              <Link
                href="/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                + New Prompt
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <AdminTable prompts={(prompts as PromptRow[]) || []} />
          </div>
        </div>
      </AdminAuthCheck>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}