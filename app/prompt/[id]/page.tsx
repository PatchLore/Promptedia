import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import WrapperClient from '@/app/WrapperClient';

type PromptRecord = { id?: string; slug?: string | null; [key: string]: any };

export default async function LegacyPromptRedirect({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabase
    .from('prompts')
    .select('slug')
    .eq('id', params.id)
    .single<PromptRecord>();

  if (error || !data?.slug) {
    redirect('/prompts');
  }

  redirect(`/prompts/${data.slug}`);

  return <WrapperClient>{null}</WrapperClient>;
}
