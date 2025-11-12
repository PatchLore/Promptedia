'use client';

import { useState, useEffect } from 'react';
import type { PromptRow } from '@/lib/supabase/client';

type PromptDetailClientProps = {
  prompt: PromptRow;
};

export default function PromptDetailClient({ prompt }: PromptDetailClientProps) {
  const [copied, setCopied] = useState(false);

  // Debug: Log mount/unmount to detect re-renders
  useEffect(() => {
    console.log('[PromptDetailClient] Mounted', {
      slug: prompt?.slug,
      id: prompt?.id,
      title: prompt?.title,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    });
    return () => {
      console.log('[PromptDetailClient] Unmounted', {
        slug: prompt?.slug,
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      });
    };
  }, [prompt?.slug, prompt?.id, prompt?.title]);

  const handleCopyPrompt = async () => {
    if (!prompt.prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      {prompt.prompt && (
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {prompt.prompt}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleCopyPrompt}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-sm text-base font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
            {prompt.example_url && (
              <a
                href={prompt.example_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-900 dark:text-white text-center text-base font-medium"
              >
                Open Example
              </a>
            )}
          </div>
        </section>
      )}

      {prompt.audio_preview_url && (
        <section className="pt-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Audio Preview</h2>
          <audio
            controls
            preload="none"
            className="w-full rounded-lg"
            src={prompt.audio_preview_url}
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
        </section>
      )}
    </>
  );
}

