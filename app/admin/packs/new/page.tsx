import AdminAuthCheck from '@/components/AdminAuthCheck';
import WrapperClient from '@/app/WrapperClient';
import CreatePackForm from '@/components/admin/CreatePackForm';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/admin/packs/new`;

export default function CreatePackPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Create New Pack',
    url: canonicalUrl,
    description: 'Create a new prompt pack.',
  };

  const content = (
    <>
      <head>
        <title>Create New Pack | Admin | OnPointPrompt</title>
        <meta name="description" content="Create a new prompt pack." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Create New Pack | Admin | OnPointPrompt" />
        <meta property="og:description" content="Create a new prompt pack." />
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Create New Pack</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new prompt pack to the catalog
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <CreatePackForm />
          </div>
        </div>
      </AdminAuthCheck>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}

