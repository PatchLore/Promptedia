import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PromptGrid from '@/components/PromptGrid';

export const metadata = {
  title: 'My Favorites - Promptopedia',
  description: 'View your saved favorite prompts',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Get user's favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select('prompt_id')
    .eq('user_id', user.id);

  const promptIds = (favorites as any)?.map((f: any) => f.prompt_id) || [];

  let prompts: any[] = [];
  if (promptIds.length > 0) {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .in('id', promptIds)
      .order('created_at', { ascending: false });
    prompts = (data as any) || [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Favorites</h1>
      {prompts.length > 0 ? (
        <PromptGrid prompts={prompts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            You haven't saved any favorites yet. Start browsing prompts and save the ones you like!
          </p>
        </div>
      )}
    </div>
  );
}
