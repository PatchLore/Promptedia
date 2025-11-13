import { notFound } from 'next/navigation';
import AdminAuthCheck from '@/components/AdminAuthCheck';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import EditPackForm from '@/components/admin/EditPackForm';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

type EditPackPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPackPage({ params }: EditPackPageProps) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  // Load pack
  const { data: pack, error: packError } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (packError || !pack) {
    notFound();
  }

  // Load prompts in this pack
  const { data: packPromptsData } = await (supabase as any)
    .from('pack_prompts')
    .select('prompt_id')
    .eq('pack_id', id);

  const promptIds = packPromptsData?.map((item: any) => item.prompt_id) || [];

  let assignedPrompts: any[] = [];
  if (promptIds.length > 0) {
    const { data: promptsData } = await supabase
      .from('prompts')
      .select('id, title, slug, category')
      .in('id', promptIds);

    assignedPrompts = promptsData || [];
  }

  const canonicalUrl = `${siteUrl}/admin/packs/${id}`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Edit Pack: ${pack.title}`,
    url: canonicalUrl,
    description: `Edit pack details and prompt assignments.`,
  };

  const content = (
    <>
      <head>
        <title>Edit Pack: {pack.title} | Admin | OnPointPrompt</title>
        <meta name="description" content={`Edit pack: ${pack.title}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`Edit Pack: ${pack.title} | Admin | OnPointPrompt`} />
        <meta property="og:description" content={`Edit pack: ${pack.title}`} />
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
            <h1 className="text-4xl font-bold mb-2">Edit Pack</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update pack details and manage prompt assignments
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <EditPackForm pack={pack} assignedPrompts={assignedPrompts} />
          </div>
        </div>
      </AdminAuthCheck>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}

