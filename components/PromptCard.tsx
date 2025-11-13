'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import AffiliateCTA from './AffiliateCTA';
import OptimizedImage from './OptimizedImage';
import { useAudioPreview } from '@/hooks/useAudioPreview';
import { supabase } from '@/lib/supabase/client';
import { isImagePrompt } from '@/lib/isImagePrompt';
import { getImageUrl } from '@/lib/getImageUrl';

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
  // Prioritize slug-based routing, fallback to ID if slug not available
  const cardHref = safeSlug ? `/prompts/${safeSlug}` : safeId ? `/prompt/${safeId}` : null;

  // Debug: Log slug value for troubleshooting
  if (process.env.NODE_ENV === 'development' && safeSlug) {
    console.log('[PromptCard] slug:', safeSlug, 'href:', cardHref);
  }

  const safeTitle = prompt?.title && typeof prompt.title === 'string' && prompt.title.trim().length > 0
    ? prompt.title.trim()
    : 'Unnamed Prompt';

  // Get description - filter out placeholder text
  const description = prompt?.description && 
    typeof prompt.description === 'string' && 
    prompt.description.trim() && 
    !/no description available/i.test(prompt.description.trim())
    ? prompt.description.trim()
    : null;

  const rawTags = Array.isArray(prompt?.tags) ? prompt.tags : [];
  const safeTags = rawTags.length > 0 ? rawTags.filter((tag: any) => tag && typeof tag === 'string' && tag.trim().length > 0) : [];

  // Only get image URL if a valid image exists (not placeholder paths)
  const safeImageUrl = useMemo(() => {
    // Priority: image_url → art_url → thumbnail_url → example_url
    // Only return if it's a valid HTTP URL (not placeholder paths)
    if (isValidHttpUrl((prompt as any)?.image_url)) return (prompt as any).image_url;
    if (isValidHttpUrl(prompt?.art_url)) return prompt.art_url;
    if (isValidHttpUrl(prompt?.thumbnail_url) && !prompt.thumbnail_url.includes('/images/placeholder')) return prompt.thumbnail_url;
    if (isValidHttpUrl(prompt?.example_url)) return prompt.example_url;
    return null; // No image available
  }, [(prompt as any)?.image_url, prompt?.art_url, prompt?.thumbnail_url, prompt?.example_url]);

  const audioUrl = isValidHttpUrl(prompt?.audio_preview_url) ? prompt.audio_preview_url : null;

  const { isPlaying, currentUrl, error, play, stop } = useAudioPreview();
  const isCurrentPreview = Boolean(audioUrl && isPlaying && currentUrl === audioUrl);
  const showAudioError = Boolean(isCurrentPreview && error);

  const handlePreviewClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!audioUrl) {
      return;
    }
    if (isCurrentPreview) {
      stop();
    } else {
      play(audioUrl);
    }
  };

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId || !isAuthenticated) {
      return;
    }
    onToggleSave?.(safeId, !saved);
  };

  const handleOpenCollections = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId || !isAuthenticated) {
      return;
    }
    onOpenCollections?.(safeId);
  };

  const handleRemoveFromCollection = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!safeId) {
      return;
    }
    onRemoveFromCollection?.(safeId);
  };

  const CategoryBadgeContent = prompt?.category ? (
    <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-black/60 text-gray-900 dark:text-white backdrop-blur pointer-events-none">
      {getCategoryEmoji(prompt.category)} {prompt.category}
    </div>
  ) : null;

  const CategoryBadgeAbsolute = prompt?.category ? (
    <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-black/60 text-gray-900 dark:text-white backdrop-blur pointer-events-none">
      {getCategoryEmoji(prompt.category)} {prompt.category}
    </div>
  ) : null;

  const PreviewButton = (
    <button
      type="button"
      disabled={!audioUrl}
      onClick={handlePreviewClick}
      aria-pressed={isCurrentPreview}
      className={`absolute bottom-3 right-3 z-20 inline-flex items-center justify-center rounded-full border border-white/70 bg-black/70 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-blue-400 h-11 w-11 shadow-lg ${
        audioUrl ? 'hover:bg-black/80 active:bg-black/90' : 'cursor-not-allowed opacity-60'
      }`}
    >
      <span className="sr-only">
        {audioUrl ? (isCurrentPreview ? 'Stop audio preview' : 'Play audio preview') : 'Audio preview unavailable'}
      </span>
      <span aria-hidden="true" className="text-lg">
        {isCurrentPreview ? '■' : '▶️'}
      </span>
    </button>
  );

  const SaveButton =
    isAuthenticated && safeId ? (
      <button
        type="button"
        onClick={handleSaveClick}
        aria-pressed={saved}
        className="absolute top-2 right-2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/70 text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:opacity-90"
      >
        <span className="sr-only">{saved ? 'Unsave prompt' : 'Save prompt'}</span>
        <span aria-hidden="true" className="text-lg">
          {saved ? '❤️' : '🤍'}
        </span>
      </button>
    ) : null;

  const CollectionsButton =
    isAuthenticated && safeId ? (
      <button
        type="button"
        onClick={handleOpenCollections}
        className="absolute top-2 right-12 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900/90 text-white shadow-lg transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <span className="sr-only">Add prompt to collection</span>
        <span aria-hidden="true" className="text-lg">
          📁
        </span>
      </button>
    ) : null;

  const RemoveFromCollectionButton =
    showRemoveFromCollection && safeId ? (
      <button
        type="button"
        onClick={handleRemoveFromCollection}
        className="absolute top-2 right-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900/90 text-white shadow-lg transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <span className="sr-only">Remove prompt from collection</span>
        <span aria-hidden="true" className="text-base">
          ❌
        </span>
      </button>
    ) : null;

  const CardContent = (
    <>
      <div className="p-4 flex-grow flex flex-col gap-3">
        <div className="space-y-2">
          {cardHref ? (
            <Link 
              href={cardHref} 
              className="block group relative z-10"
              onClick={(e) => {
                // Debug: Log click event
                if (process.env.NODE_ENV === 'development') {
                  console.log('[PromptCard] Title Link clicked:', cardHref, 'slug:', safeSlug);
                }
                // Ensure click isn't blocked
                e.stopPropagation();
              }}
            >
              <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                {safeTitle}
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white">
              {safeTitle}
            </h3>
          )}
          {description && !/no description available/i.test(description.trim()) ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {description.trim()}
            </p>
          ) : null}
        </div>

        {/* Small image preview - only show if image exists */}
        {safeImageUrl && (
          <div className="relative w-full h-32 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
            {cardHref ? (
              <Link 
                href={cardHref} 
                className="block h-full w-full relative z-0"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                }}
              >
                <OptimizedImage
                  src={safeImageUrl}
                  alt={safeTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  mode="card"
                />
              </Link>
            ) : (
              <OptimizedImage
                src={safeImageUrl}
                alt={safeTitle}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                mode="card"
              />
            )}
            {/* Category badge on image */}
            {CategoryBadgeAbsolute}
            {/* Buttons on image */}
            {!showRemoveFromCollection && CollectionsButton}
            {!showRemoveFromCollection && SaveButton}
            {RemoveFromCollectionButton}
            {PreviewButton}
            {showAudioError && (
              <div className="absolute left-3 right-20 bottom-3 text-xs font-medium text-red-300 bg-red-900/70 rounded-lg px-3 py-2 shadow">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Category badge - show if no image */}
        {!safeImageUrl && CategoryBadgeContent && (
          <div className="flex items-center gap-2">
            {CategoryBadgeContent}
          </div>
        )}

        {audioUrl && (
          <audio
            controls
            preload="none"
            className="w-full mt-2 rounded-lg"
            src={audioUrl}
            onPlay={(e) => {
              // Stop any other playing audio when this one starts
              const audios = document.querySelectorAll('audio');
              audios.forEach((audio) => {
                if (audio !== e.currentTarget && !audio.paused) {
                  audio.pause();
                }
              });
            }}
          >
            Your browser does not support audio playback.
          </audio>
        )}

        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {safeTags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <AffiliateCTA category={prompt?.category} small meta={{ prompt_id: safeId ?? undefined }} />
        </div>
      </div>
    </>
  );

  // Render card with clickable image and title (not entire card to avoid conflicts with buttons)
  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 ease-out hover:scale-105 overflow-hidden h-full flex flex-col">
      {CardContent}
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
