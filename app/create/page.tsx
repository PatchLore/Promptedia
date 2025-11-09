import CreatePromptForm from '@/components/CreatePromptForm';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

export default function CreatePage() {
  const content = (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={null} />
    </div>
  );

  return <WrapperClient>{content}</WrapperClient>;
}



