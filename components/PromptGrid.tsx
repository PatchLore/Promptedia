import PromptCard from './PromptCard';
import React from 'react';

type PromptGridProps = {
  prompts: any[];
};

function PromptGrid({ prompts }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No prompts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}

export default React.memo(PromptGrid);
