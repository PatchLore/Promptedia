import Link from 'next/link';
import { buildPromptPath } from '@/lib/slug';
import AffiliateCTA from './AffiliateCTA';
import OptimizedImage from './OptimizedImage';

type PromptCardProps = {
  prompt: any;
};

export default function PromptCard({ prompt }: PromptCardProps) {
  const hasPreview =
    prompt.type !== 'audio' &&
    typeof prompt.example_url === 'string' &&
    /^https?:/i.test(prompt.example_url);

  return (
    <Link href={buildPromptPath(prompt)}>
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 ease-out hover:scale-105 overflow-hidden h-full flex flex-col">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {prompt.type === 'audio' ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎵</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Audio Preview</div>
              </div>
            </div>
          ) : (
            <>
              <OptimizedImage
                src={hasPreview ? prompt.example_url : undefined}
                alt={prompt.title || 'Prompt thumbnail'}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
              {hasPreview ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="text-3xl mb-1">🖼️</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Image Preview</div>
                </div>
              )}
            </>
          )}
          {prompt.category && (
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-black/60 text-gray-900 dark:text-white backdrop-blur">
              {getCategoryEmoji(prompt.category)} {prompt.category}
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {prompt.title || 'Untitled Prompt'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {prompt.prompt}
          </p>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {prompt.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <AffiliateCTA category={prompt.category} small meta={{ prompt_id: prompt.id }} />
          <div className="mt-auto" />
        </div>
      </article>
    </Link>
  );
}

function getCategoryEmoji(category?: string) {
  const key = (category || '').toLowerCase();
  if (key.includes('code') || key === 'coding') return '💻';
  if (key.includes('music')) return '🎵';
  if (key.includes('art')) return '🎨';
  if (key.includes('write') || key === 'writing') return '✍️';
  if (key.includes('business')) return '💼';
  return '✨';
}
