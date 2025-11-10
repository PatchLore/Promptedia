import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

type PromptRecord = { id?: string; slug?: string | null; [key: string]: any };

export default async function LegacyPromptRedirect({
  params,
}: {
  params: { id: string };
}) {
  const canonicalUrl = `${siteUrl}/prompt/${params.id}`;

  const { data, error } = await supabase
    .from('prompts')
    .select('slug')
    .eq('id', params.id)
    .single<PromptRecord>();

  if (error || !data?.slug) {
    redirect('/prompts');
  }

  redirect(`/prompts/${data.slug}`);

  return (
    <>
      <head>
        <title>Redirecting… | On Point Prompt</title>
        <meta
          name="description"
          content="This legacy prompt route has moved to a new slug-based URL."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Redirecting… | On Point Prompt" />
        <meta
          property="og:description"
          content="This prompt now lives on a new slug-based page on On Point Prompt."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${siteUrl}/og.png`} />
        <meta property="og:type" content="website" />
      </head>
      <WrapperClient>{null}</WrapperClient>
    </>
  );
}
