import Link from 'next/link';
import AdminAuthCheck from '@/components/AdminAuthCheck';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { deletePack } from '@/app/actions-packs';
import PacksTable from '@/components/admin/PacksTable';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/admin/packs`;

export default async function AdminPacksPage() {
  const supabase = getSupabaseServerClient();

  const { data: packs, error } = await (supabase as any)
    .from('packs')
    .select('id, title, slug, price, image_url, category')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching packs:', error);
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Admin Pack Manager',
    url: canonicalUrl,
    description: 'Manage prompt packs in the OnPointPrompt catalog.',
  };

  const content = (
    <>
      <head>
        <title>Pack Manager | Admin | OnPointPrompt</title>
        <meta
          name="description"
          content="Manage prompt packs, images, and prompt assignments."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Pack Manager | Admin | OnPointPrompt" />
        <meta
          property="og:description"
          content="Manage prompt packs, images, and prompt assignments."
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Pack Manager</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage prompt packs, images, and prompt assignments
              </p>
            </div>
            <Link
              href="/admin/packs/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              + Create New Pack
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <PacksTable packs={(packs || [])} />
          </div>
        </div>
      </AdminAuthCheck>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}

