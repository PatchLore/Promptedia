'use client';

import Link from 'next/link';
import { useAudioPreview } from '@/hooks/useAudioPreview';

type MusicPreviewSectionProps = {
  audioUrl: string | null;
  promptText: string;
};

function isValidHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:/i.test(value.trim());
}

export default function MusicPreviewSection({ audioUrl, promptText }: MusicPreviewSectionProps) {
  const normalizedUrl = isValidHttpUrl(audioUrl) ? audioUrl : null;
  const soundswoopUrl = `https://www.soundswoop.com/create?prompt=${encodeURIComponent(promptText)}`;

  const { isPlaying, currentUrl, error, play, stop } = useAudioPreview();
  const isCurrentPreview = Boolean(normalizedUrl && isPlaying && currentUrl === normalizedUrl);

  const handlePreviewClick = () => {
    if (!normalizedUrl) {
      return;
    }

    if (isCurrentPreview) {
      stop();
    } else {
      play(normalizedUrl);
    }
  };

  if (normalizedUrl) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600 space-y-3">
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 break-all">Audio preview: {normalizedUrl}</div>
          )}

          <button
            type="button"
            onClick={handlePreviewClick}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow ${
              isCurrentPreview
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span aria-hidden="true">{isCurrentPreview ? '■' : '▶️'}</span>
            <span>{isCurrentPreview ? 'Stop Preview' : 'Play Preview'}</span>
          </button>

          {error && isCurrentPreview && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400 font-medium">🔗 Linked App</span>
          <Link
            href={soundswoopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
          >
            Try in Soundswoop →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 text-center space-y-4">
      <div className="space-y-2">
        <div className="text-4xl mb-2">🎧</div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          No audio preview available yet.
        </p>
      </div>

      <Link
        href={soundswoopUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-medium"
      >
        Try this prompt in Soundswoop →
      </Link>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🔗 <span className="font-medium">powered by Soundswoop</span>
        </p>
      </div>
    </div>
  );
}



