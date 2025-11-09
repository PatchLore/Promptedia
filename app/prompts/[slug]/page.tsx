import { supabase, PromptRow } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `${params.slug} | OnPointPrompt`,
    description: `AI prompt: ${params.slug}`,
  };
}

export default async function PromptSlugPage({ params }: { params: { slug: string } }) {
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('slug', params.slug)
    .single<PromptRow>();

  if (error || !prompt || !prompt.slug) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Prompt fetch error:', error);
    }
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-6 text-white">{prompt.title}</h1>

      {prompt.description && (
        <p className="text-gray-300 text-lg mb-8">{prompt.description}</p>
      )}

      {prompt.prompt && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-3 text-white">Prompt</h2>
          <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">
            {prompt.prompt}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(prompt.prompt ?? '')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-md"
          >
            Copy Prompt
          </button>
        </div>
      )}

      <div className="text-sm text-gray-400 mt-4">
        <span className="font-medium text-gray-300">Category:</span>{' '}
        {prompt.category || 'Uncategorised'}
      </div>
    </div>
  );
}
