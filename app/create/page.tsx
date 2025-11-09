import CreatePromptForm from '@/components/CreatePromptForm';

export const dynamic = 'force-dynamic';

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={null} />
    </div>
  );
}



