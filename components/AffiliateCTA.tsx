'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { Affiliate, pickAffiliateForCategory, getAffiliateDescription, getAffiliateEmoji } from '@/lib/affiliate';

type Props = {
  affiliate?: Affiliate | null; // Optional: if provided, use it; otherwise fetch by category
  category?: string; // Required if affiliate is not provided
  small?: boolean;
  meta?: Record<string, any>;
};

/**
 * Truncates text to max length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export default function AffiliateCTA({ affiliate: affiliateProp, category, small, meta }: Props) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(affiliateProp || null);
  const [loading, setLoading] = useState(!affiliateProp && !!category);

  useEffect(() => {
    // If affiliate is provided, use it; otherwise fetch by category
    if (affiliateProp) {
      setAffiliate(affiliateProp);
      setLoading(false);
      return;
    }

    if (!category) {
      setLoading(false);
      return;
    }

    // Fetch affiliate on client side
    pickAffiliateForCategory(category)
      .then((aff) => {
        setAffiliate(aff);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching affiliate:', error);
        setLoading(false);
      });
  }, [affiliateProp, category]);

  if (loading || !affiliate) {
    return null; // Don't show anything while loading or if no affiliate found
  }

  const description = getAffiliateDescription(category, affiliate.name);
  const emoji = getAffiliateEmoji(category, affiliate.name);
  const truncatedDescription = truncateText(description, 40);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture('tool_clicked', {
        tool_name: affiliate.name,
        tool_url: affiliate.affiliate_url,
        commission_value: affiliate.commission_value,
        commission_type: affiliate.commission_type,
        location: small ? 'card' : 'detail',
        ...(meta || {}),
      });
    }
    
    if (typeof window !== 'undefined') {
      window.open(affiliate.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full ${small ? 'mt-3' : 'mt-4'} max-w-[280px] mx-auto`}>
      <div
        className="flex flex-col justify-between items-center bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm w-full p-3 min-h-[120px] sm:min-h-[130px] text-center cursor-pointer hover:shadow-md transition-all"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        aria-label={`Generate with ${affiliate.name}`}
      >
        <div className="flex flex-col items-center flex-grow justify-center">
          <span className="text-2xl mb-1">{emoji}</span>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate w-full px-1">
            Generate with {affiliate.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5 px-1">
            {truncatedDescription}
          </p>
        </div>
        <button
          type="button"
          className="mt-2 inline-block text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-md transition-all font-medium"
          onClick={handleClick}
        >
          Try {affiliate.name}
        </button>
      </div>
    </div>
  );
}


