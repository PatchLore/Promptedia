import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    .single();

  if (error || !data || !data.slug) {
    redirect('/prompts');
  }

  redirect(`/prompts/${data.slug}`);
}
