'use client';

import { useEffect, useState } from 'react';
import PromptGrid from '@/components/PromptGrid';
import { supabase } from '@/lib/supabase/client';
import type { PromptRow } from '@/lib/supabase/client';

interface ProfileClientProps {
  promptIds: string[];
}

export default function ProfileClient({ promptIds }: ProfileClientProps) {
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPrompts() {
      if (promptIds.length === 0) {
        if (active) {
          setPrompts([]);
          setIsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .in('id', promptIds)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Error loading prompts:', error);
        setPrompts([]);
      } else {
        setPrompts(data || []);
      }

      setIsLoading(false);
    }

    loadPrompts();

    return () => {
      active = false;
    };
  }, [promptIds]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-xl bg-gray-800/50 h-48" />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
          You haven&apos;t saved any favorites yet. Start browsing prompts and save the ones you like!
        </p>
      </div>
    );
  }

  return <PromptGrid prompts={prompts} />;
}
