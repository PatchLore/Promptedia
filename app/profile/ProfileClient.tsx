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
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading favorites…</p>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          You haven't saved any favorites yet. Start browsing prompts and save the ones you like!
        </p>
      </div>
    );
  }

  return <PromptGrid prompts={prompts} />;
}
