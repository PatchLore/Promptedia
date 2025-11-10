import PromptCard from './PromptCard';
import React from 'react';

type PromptGridProps = {
  prompts: any[];
  isLoading?: boolean;
  skeletonCount?: number;
};

function PromptGrid({ prompts, isLoading = false, skeletonCount = 6 }: PromptGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40"
          >
            <div className="animate-pulse bg-gray-800/60 aspect-[16/9]" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-2/3 rounded bg-gray-800/60" />
              <div className="h-4 w-full rounded bg-gray-800/40" />
              <div className="h-4 w-5/6 rounded bg-gray-800/30" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
          No prompts found. Try adjusting your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id || prompt.slug} prompt={prompt} />
      ))}
    </div>
  );
}

export default React.memo(PromptGrid);
