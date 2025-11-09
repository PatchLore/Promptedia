import { supabase } from '@/lib/supabase/client';
import CreatePromptForm from '@/components/CreatePromptForm';

export const metadata = {
  title: 'Create Prompt - On Point Prompt',
  description: 'Submit a new AI prompt to the On Point Prompt library',
};

export default async function CreatePage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={user?.id || null} />
    </div>
  );
}



