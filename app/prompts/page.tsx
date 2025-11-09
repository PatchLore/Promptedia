import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default async function PromptsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const category = params?.category || '';
  const search = params?.q || '';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('prompts')
    .select('slug, title, description, category')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: prompts, error } = await query;

  if (error) {
    console.error('Error fetching prompts:', error);
    return <div>Error loading prompts.</div>;
  }

  if (!prompts?.length) {
    return <div>No prompts found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">All Prompts</h1>
      <div className="flex flex-wrap gap-3 mb-8">
        {['Writing', 'Art', 'Coding', 'Business', 'Music'].map((cat) => (
          <Link
            key={cat}
            href={`/prompts?category=${cat}`}
            className={`px-3 py-1 rounded-md text-sm ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </Link>
        ))}
        {category && (
          <Link
            href="/prompts"
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
          >
            Clear
          </Link>
        )}
      </div>
      <form method="get" className="mb-8">
        {category && (
          <input type="hidden" name="category" value={category} />
        )}
        <input
          type="text"
          name="q"
          placeholder="Search prompts..."
          defaultValue={search}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <Link
            key={prompt.slug}
            href={`/prompts/${prompt.slug}`}
            className="block bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:bg-gray-900 transition shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white line-clamp-2">{prompt.title}</h2>

            {prompt.description && (
              <p className="text-gray-400 text-sm mt-3 line-clamp-3">
                {prompt.description}
              </p>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <span className="bg-gray-800 px-2 py-1 rounded-md text-gray-300">
                {prompt.category || 'Uncategorised'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

