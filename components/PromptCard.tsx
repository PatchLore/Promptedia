'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import AffiliateCTA from './AffiliateCTA';
import { useAudioPreview } from '@/hooks/useAudioPreview';

type PromptCardProps = {
  prompt: any;
  saved?: boolean;
  onToggleSave?: (promptId: string, shouldSave: boolean) => void;
  onOpenCollections?: (promptId: string) => void;
  onRemoveFromCollection?: (promptId: string) => void;
  showRemoveFromCollection?: boolean;
  isAuthenticated?: boolean;
};

function isValidHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:/i.test(value.trim());
}

export default function PromptCard({
  prompt,
  saved = false,
  onToggleSave,
  onOpenCollections,
  onRemoveFromCollection,
  showRemoveFromCollection = false,
  isAuthenticated = false,
}: PromptCardProps) {
  if (!prompt) {
    return null;
  }

  const safeId = typeof prompt.id === 'string' && prompt.id.trim().length > 0 ? prompt.id.trim() : null;
  const safeSlug = typeof prompt.slug === 'string' && prompt.slug.trim().length > 0 ? prompt.slug.trim() : null;
  const cardHref = safeSlug ? `/prompts/${safeSlug}` : safeId ? `/prompt/${safeId}` : null;

  const safeTitle = prompt?.title && typeof prompt.title === 'string' && prompt.title.trim().length > 0
    ? prompt.title.trim()
    : 'Unnamed Prompt';

  const description = prompt?.description && 
    typeof prompt.description === 'string' && 
    prompt.description.trim() && 
    !/no description available/i.test(prompt.description.trim())
    ? prompt.description.trim()
    : null;

  const rawTags = Array.isArray(prompt?.tags) ? prompt.tags : [];
  const safeTags = rawTags.length > 0 ? rawTags.filter((tag: any) => tag && typeof tag === 'string' && tag.trim().length > 0) : [];

  // Determine final image URL - only if valid HTTP URL exists
  const imageUrl = useMemo(() => {
    if (isValidHttpUrl(prompt?.image_url)) return prompt.image_url;
    if (isValidHttpUrl(prompt?.thumbnail_url) && !prompt.thumbnail_url.includes('/images/placeholder')) return prompt.thumbnail_url;
    if (isValidHttpUrl(prompt?.example_url)) return prompt.example_url;
    return null;
  }, [prompt?.image_url, prompt?.thumbnail_url, prompt?.example_url]);

  const audioUrl = isValidHttpUrl(prompt?.audio_preview_url) ? prompt.audio_preview_url : null;

  const { isPlaying, currentUrl, error, play, stop } = useAudioPreview();
  const isCurrentPreview = Boolean(audioUrl && isPlaying && currentUrl === audioUrl);

  const handlePreviewClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!audioUrl) return;
    if (isCurrentPreview) {
      stop();
    } else {
      play(audioUrl);
    }
  };

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId || !isAuthenticated) return;
    onToggleSave?.(safeId, !saved);
  };

  const handleOpenCollections = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId || !isAuthenticated) return;
    onOpenCollections?.(safeId);
  };

  const handleRemoveFromCollection = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId) return;
    onRemoveFromCollection?.(safeId);
  };

  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition relative">
      {/* Action buttons - top right */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {showRemoveFromCollection && safeId && (
          <button
            type="button"
            onClick={handleRemoveFromCollection}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/90 text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Remove prompt from collection"
          >
            <span className="text-sm">×</span>
          </button>
        )}
        {!showRemoveFromCollection && isAuthenticated && safeId && (
          <>
            {onOpenCollections && (
              <button
                type="button"
                onClick={handleOpenCollections}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/90 text-white shadow-sm transition hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Add prompt to collection"
              >
                <span className="text-sm">📁</span>
              </button>
            )}
            {onToggleSave && (
              <button
                type="button"
                onClick={handleSaveClick}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/90 text-white shadow-sm transition hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={saved ? 'Unsave prompt' : 'Save prompt'}
              >
                <span className="text-sm">{saved ? '❤️' : '🤍'}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Image - only show if exists */}
      {imageUrl && (
        <div className="relative mb-3">
          {cardHref ? (
            <Link href={cardHref} className="block">
              <img
                src={imageUrl}
                alt={safeTitle}
                className="w-full h-40 rounded-xl object-cover"
                loading="lazy"
              />
            </Link>
          ) : (
            <img
              src={imageUrl}
              alt={safeTitle}
              className="w-full h-40 rounded-xl object-cover"
              loading="lazy"
            />
          )}
          {/* Audio preview button on image if audio exists */}
          {audioUrl && (
            <button
              type="button"
              onClick={handlePreviewClick}
              className="absolute bottom-3 right-3 z-20 inline-flex items-center justify-center rounded-full border border-white/70 bg-black/70 text-white transition hover:bg-black/80 h-10 w-10 shadow-lg"
              aria-label={isCurrentPreview ? 'Stop audio preview' : 'Play audio preview'}
            >
              <span className="text-lg">{isCurrentPreview ? '■' : '▶️'}</span>
            </button>
          )}
        </div>
      )}

      {/* Category badge */}
      <div className="flex items-center justify-between mb-2">
        {prompt?.category && (
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
            {getCategoryEmoji(prompt.category)} {prompt.category}
          </span>
        )}
      </div>

      {/* Title */}
      {cardHref ? (
        <Link href={cardHref} className="block mb-1">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {safeTitle}
          </h3>
        </Link>
      ) : (
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-white">
          {safeTitle}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Tags */}
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {safeTags.map((tag: string) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Audio player - show below content if no image */}
      {audioUrl && !imageUrl && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <span className="text-lg">{isCurrentPreview ? '■' : '▶️'}</span>
            <span className="text-sm">{isCurrentPreview ? 'Stop Preview' : 'Play Preview'}</span>
          </button>
        </div>
      )}

      {/* Affiliate CTA */}
      {prompt?.affiliate_cta ? (
        <div className="mt-2">{prompt.affiliate_cta}</div>
      ) : (
        <div className="mt-2">
          <AffiliateCTA category={prompt?.category} small meta={{ prompt_id: safeId ?? undefined }} />
        </div>
      )}
    </article>
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
