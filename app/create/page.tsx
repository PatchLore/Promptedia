import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreatePromptForm from '@/components/CreatePromptForm';

export const metadata = {
  title: 'Create Prompt - Promptopedia',
  description: 'Submit a new AI prompt to the Promptopedia library',
};

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For MVP, allow anyone to create (you can add admin check later)
  // if (!user) {
  //   redirect('/');
  // }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={user?.id || null} />
    </div>
  );
}



