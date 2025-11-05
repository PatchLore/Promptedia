'use client';

import { useState } from 'react';
import { toggleFavorite } from '@/app/actions';

type CopyButtonProps = {
  promptText: string;
};

export function CopyButton({ promptText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      {copied ? 'Copied!' : 'Copy Prompt'}
    </button>
  );
}

type FavoriteButtonProps = {
  promptId: string;
  isFavorite: boolean;
};

export function FavoriteButton({ promptId, isFavorite: initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newState = await toggleFavorite(promptId);
      setIsFavorite(newState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
        isFavorite
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {isFavorite ? '❤️ Saved' : '🤍 Save'}
    </button>
  );
}



