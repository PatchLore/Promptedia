'use client';

import { useState } from 'react';
import Image from 'next/image';

type UnsplashImageButtonProps = {
  title: string;
  category: string;
  onImageSelected: (url: string) => void;
};

export default function UnsplashImageButton({ title, category, onImageSelected }: UnsplashImageButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = async () => {
    if (!title || !category) {
      setError('Title and category are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus(null);
    setPreviewUrl(null);

    try {
      const query = `${title}`;
      const url = new URL('/api/unsplash/search', window.location.origin);
      url.searchParams.set('query', query);
      url.searchParams.set('category', category);
      url.searchParams.set('orientation', 'landscape');
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch image');
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setPreviewUrl(data.imageUrl);
        setStatus('✅ Image found! Click "Save Image" to use it.');
      } else {
        setStatus('⚠️ No match found.');
        setError(data.message || 'No results found for this prompt.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch image');
      setStatus('❌ Error fetching image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = () => {
    if (previewUrl) {
      onImageSelected(previewUrl);
      setStatus('✅ Image saved!');
      setTimeout(() => {
        setStatus(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={fetchImage}
        disabled={isLoading || !title || !category}
        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
        title="Fetch image from Unsplash"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span className="hidden sm:inline">Loading...</span>
          </>
        ) : (
          <>
            <span>🖼️</span>
            <span className="hidden sm:inline">Fetch Image</span>
          </>
        )}
      </button>

      {status && (
        <div className={`text-xs ${status.includes('✅') ? 'text-green-600 dark:text-green-400' : status.includes('⚠️') ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
          {status}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {previewUrl && (
        <div className="space-y-2">
          <div className="relative w-full h-32 rounded overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <Image
              src={previewUrl}
              alt="Unsplash preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
              loading="lazy"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveImage}
            className="w-full px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            Save Image
          </button>
        </div>
      )}
    </div>
  );
}



