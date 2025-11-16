'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WrapperClient from '@/app/WrapperClient';
import TesterTabs from '@/components/TesterTabs';
import ProUpsellModal from '@/components/ProUpsellModal';

type TestResult = {
  id: string;
  prompt: string;
  output: string;
  timestamp: number;
};

const STORAGE_KEY_PROMPT = 'tester-last-prompt';
const STORAGE_KEY_RESULTS = 'tester-results';
const STORAGE_KEY_DAILY_COUNT = 'tester_daily_count';
const STORAGE_KEY_LAST_DATE = 'tester_last_date';
const MAX_RESULTS = 5;
const DAILY_LIMIT = 3;

export default function TesterPage() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('gemini');
  const [showModal, setShowModal] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Check and update daily limit
  const checkDailyLimit = () => {
    if (typeof window === 'undefined') return { count: 0, limitReached: false };

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_LAST_DATE);
    const savedCount = localStorage.getItem(STORAGE_KEY_DAILY_COUNT);

    // Reset if it's a new day
    if (lastDate !== today) {
      localStorage.setItem(STORAGE_KEY_LAST_DATE, today);
      localStorage.setItem(STORAGE_KEY_DAILY_COUNT, '0');
      return { count: 0, limitReached: false };
    }

    // Get current count
    const count = savedCount ? parseInt(savedCount, 10) : 0;
    const limitReached = count >= DAILY_LIMIT;

    return { count, limitReached };
  };

  // Increment daily count
  const incrementDailyCount = () => {
    if (typeof window === 'undefined') return;

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_LAST_DATE);

    if (lastDate !== today) {
      // New day, reset
      localStorage.setItem(STORAGE_KEY_LAST_DATE, today);
      localStorage.setItem(STORAGE_KEY_DAILY_COUNT, '1');
      setDailyCount(1);
      setIsLimitReached(false);
    } else {
      // Same day, increment
      const currentCount = parseInt(localStorage.getItem(STORAGE_KEY_DAILY_COUNT) || '0', 10);
      const newCount = currentCount + 1;
      localStorage.setItem(STORAGE_KEY_DAILY_COUNT, newCount.toString());
      setDailyCount(newCount);
      setIsLimitReached(newCount >= DAILY_LIMIT);
    }
  };

  const handleTabClick = (tab: string) => {
    if (tab === 'gemini') {
      setActiveTab('gemini');
    } else {
      // PRO tabs - show upsell modal
      setShowModal(true);
    }
  };

  // Load prompt from URL or localStorage on mount
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    } else {
      // Load from localStorage
      const saved = localStorage.getItem(STORAGE_KEY_PROMPT);
      if (saved) {
        setPrompt(saved);
      }
    }

    // Load recent results
    const savedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setRecentResults(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse saved results:', e);
      }
    }

    // Check daily limit
    const { count, limitReached } = checkDailyLimit();
    setDailyCount(count);
    setIsLimitReached(limitReached);
  }, [searchParams]);

  const handleRunTest = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Check limit before running
    const { limitReached } = checkDailyLimit();
    if (limitReached) {
      setIsLimitReached(true);
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch('/api/tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      if (!data.output) {
        throw new Error('No output received from API');
      }

      setOutput(data.output);

      // Increment daily count after successful test
      incrementDailyCount();

      // Save prompt to localStorage
      localStorage.setItem(STORAGE_KEY_PROMPT, prompt.trim());

      // Save result to recent results
      const newResult: TestResult = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        output: data.output,
        timestamp: Date.now(),
      };

      const updatedResults = [newResult, ...recentResults].slice(0, MAX_RESULTS);
      setRecentResults(updatedResults);
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updatedResults));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadResult = (result: TestResult) => {
    setPrompt(result.prompt);
    setOutput(result.output);
    setError(null);
  };

  return (
    <WrapperClient>
      {/* Pro Upsell Modal */}
      <ProUpsellModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <main className="container mx-auto max-w-xl px-4 py-10">
        {/* Top Banner */}
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 rounded-xl text-center">
          🔥 Unlimited testing, GPT-4, Claude & history coming soon!
          <a className="underline ml-1 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors" href="/waitlist">
            Join Waitlist →
          </a>
        </div>

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            AI Prompt Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Free Gemini Edition
          </p>
        </header>

        {/* Tabs */}
        <TesterTabs activeTab={activeTab} onTabClick={handleTabClick} />

        {/* Divider */}
        <div className="border-b border-gray-200 dark:border-gray-700 my-4"></div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Enter your prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Daily Limit Message */}
        {isLimitReached && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-orange-800 dark:text-orange-200 text-sm text-center">
              Daily limit reached. Pro unlimited testing coming soon.
            </p>
          </div>
        )}

        {/* Run Button */}
        <div className="mb-6">
          <button
            onClick={handleRunTest}
            disabled={loading || !prompt.trim() || isLimitReached}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running test...
              </span>
            ) : (
              'Run Test'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Output Display */}
        {output && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Gemini 2.0 Flash Result
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {output}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Tests
            </h2>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleLoadResult(result)}
                  className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                    {result.prompt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </WrapperClient>
  );
}
