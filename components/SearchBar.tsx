'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type SearchBarProps = {
  value?: string;
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onPendingChange?: (isPending: boolean) => void;
};

export default function SearchBar({
  value,
  initialValue = '',
  placeholder = 'Search prompts...',
  onChange,
  onPendingChange,
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const initialQueryRef = useRef(isControlled ? value ?? '' : initialValue);
  const [query, setQuery] = useState(() => initialQueryRef.current);
  const [debouncedQuery, setDebouncedQuery] = useState(() => initialQueryRef.current);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isControlled) {
      const next = value ?? '';
      setQuery(next);
      setDebouncedQuery(next);
    }
  }, [isControlled, value]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(handler);
  }, [query]);

  const isPending = useMemo(() => query.length > 0 && query !== debouncedQuery, [query, debouncedQuery]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (trimmed === initialQueryRef.current.trim()) {
        return;
      }
    }

    if (isControlled && trimmed === (value ?? '').trim()) {
      return;
    }

    // Guard: Don't call onChange with empty query on prompt detail pages
    // This prevents unwanted redirects to /browse
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/prompts/')) {
      return;
    }

    onChange?.(trimmed);
  }, [debouncedQuery, onChange, isControlled, value]);

  return (
    <div className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-500 transition"
        aria-busy={isPending}
      />
      {isPending && (
        <span className="absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
          <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </span>
      )}
    </div>
  );
}



