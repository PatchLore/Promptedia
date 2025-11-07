import { createClient as createBrowserClient } from '@/lib/supabase/client';

export type Affiliate = {
  id: string;
  name: string;
  category: string[];
  affiliate_url: string;
  commission_value: number;
  commission_type: 'revshare' | 'cpa' | 'none';
  cookie_days: number;
  is_active: boolean;
  created_at: string;
};

/**
 * Picks the highest-paying active affiliate for a given category.
 * Falls back to Mixo AI if no match is found.
 */
export async function pickAffiliateForCategory(
  category?: string
): Promise<Affiliate | null> {
  if (!category) {
    return getDefaultAffiliate();
  }

  try {
    const supabase = createBrowserClient();

    // Normalize category to lowercase for matching
    const categoryLower = category.toLowerCase();

    // Fetch all active affiliates matching category
    // Using contains to match any category in the array
    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('is_active', true)
      .order('commission_value', { ascending: false });

    if (error) {
      console.error('Error fetching affiliates:', error);
      return getDefaultAffiliate();
    }

    if (!affiliates || affiliates.length === 0) {
      return getDefaultAffiliate();
    }

    // Filter affiliates that match the category
    // Type assertion needed because Supabase types may not be fully inferred
    const matchingAffiliates = (affiliates as Affiliate[]).filter((affiliate) =>
      affiliate.category?.some((cat) => categoryLower.includes(cat.toLowerCase()))
    );

    // Return the highest-paying match, or default if none found
    const selected = matchingAffiliates.length > 0 
      ? matchingAffiliates[0] 
      : getDefaultAffiliate();

    return selected;
  } catch (error) {
    console.error('Error in pickAffiliateForCategory:', error);
    return getDefaultAffiliate();
  }
}

/**
 * Returns a default affiliate (Mixo AI) when no match is found.
 */
export function getDefaultAffiliate(): Affiliate {
  return {
    id: 'default',
    name: 'Mixo AI',
    category: ['business', 'coding'],
    affiliate_url: 'https://mixo.io/?via=onpointprompt',
    commission_value: 20,
    commission_type: 'revshare',
    cookie_days: 90,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

/**
 * Gets affiliate description based on category and name.
 */
export function getAffiliateDescription(category?: string, name?: string): string {
  const categoryLower = (category || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (nameLower.includes('webflow')) return 'No-code website builder';
  if (nameLower.includes('framer')) return 'Design & prototyping tool';
  if (nameLower.includes('mixo')) return 'Launch pages for AI projects';
  if (nameLower.includes('copy.ai')) return 'AI copywriting assistant';
  if (nameLower.includes('jasper')) return 'AI writing assistant';
  if (nameLower.includes('notion')) return 'Workspace & AI writing';
  if (nameLower.includes('leonardo')) return 'AI image generation';
  if (nameLower.includes('imagine')) return 'AI art generator';
  if (nameLower.includes('midjourney')) return 'AI image generator';
  if (nameLower.includes('mubert')) return 'AI music generator';
  if (nameLower.includes('soundraw')) return 'AI music creation';
  if (nameLower.includes('soundswoop')) return 'Music prompt engine';

  // Fallback by category
  if (categoryLower.includes('art')) return 'AI image generator';
  if (categoryLower.includes('music')) return 'AI music generator';
  if (categoryLower.includes('writing')) return 'AI writing assistant';
  if (categoryLower.includes('business') || categoryLower.includes('coding')) {
    return 'AI-powered tool';
  }

  return 'AI-powered tool';
}

/**
 * Gets emoji for affiliate based on category or name.
 */
export function getAffiliateEmoji(category?: string, name?: string): string {
  const nameLower = (name || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();

  if (nameLower.includes('webflow') || nameLower.includes('framer')) return '🌐';
  if (nameLower.includes('mixo')) return '🚀';
  if (nameLower.includes('copy') || nameLower.includes('jasper') || nameLower.includes('notion')) return '✍️';
  if (nameLower.includes('leonardo') || nameLower.includes('imagine') || nameLower.includes('midjourney')) return '🎨';
  if (nameLower.includes('mubert') || nameLower.includes('soundraw') || nameLower.includes('soundswoop')) return '🎵';

  // Fallback by category
  if (categoryLower.includes('art')) return '🎨';
  if (categoryLower.includes('music')) return '🎵';
  if (categoryLower.includes('writing')) return '✍️';
  if (categoryLower.includes('business')) return '💼';
  if (categoryLower.includes('coding')) return '💻';

  return '✨';
}

