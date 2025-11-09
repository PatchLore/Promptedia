import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type PromptRecord = { id?: string; slug?: string | null; [key: string]: any };

export default async function LegacyPromptRedirect({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prompts')
    .select('slug')
    .eq('id', params.id)
    .single<PromptRecord>();

  if (error || !data?.slug) {
    redirect('/prompts');
  }

  redirect(`/prompts/${data.slug}`);
}
