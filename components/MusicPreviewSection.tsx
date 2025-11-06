'use client';

import Link from 'next/link';

type MusicPreviewSectionProps = {
  audioUrl: string | null;
  promptText: string;
};

export default function MusicPreviewSection({ audioUrl, promptText }: MusicPreviewSectionProps) {
  const soundswoopUrl = `https://www.soundswoop.com/create?prompt=${encodeURIComponent(promptText)}`;

  if (audioUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎧</span>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Audio Preview
          </label>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          {/* Debug: show current audio URL in dev */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-2 text-xs text-gray-500 break-all">Audio preview: {audioUrl}</div>
          )}
          <audio
            controls
            preload="none"
            className="w-full"
            src={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>🔗 Linked App</span>
          <Link 
            href={soundswoopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            powered by Soundswoop →
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



