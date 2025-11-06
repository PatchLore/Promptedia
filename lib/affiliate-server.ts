import { createClient } from '@/lib/supabase/server';
import { Affiliate, getDefaultAffiliate } from './affiliate';

/**
 * Server-side version of pickAffiliateForCategory for use in Server Components.
 */
export async function pickAffiliateForCategoryServer(
  category?: string
): Promise<Affiliate | null> {
  if (!category) {
    return getDefaultAffiliate();
  }

  try {
    const supabase = await createClient();

    // Normalize category to lowercase for matching
    const categoryLower = category.toLowerCase();

    // Fetch all active affiliates
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
    const matchingAffiliates = affiliates.filter((affiliate) =>
      affiliate.category?.some((cat) => categoryLower.includes(cat.toLowerCase()))
    );

    // Return the highest-paying match, or default if none found
    const selected = matchingAffiliates.length > 0 
      ? matchingAffiliates[0] 
      : getDefaultAffiliate();

    return selected;
  } catch (error) {
    console.error('Error in pickAffiliateForCategoryServer:', error);
    return getDefaultAffiliate();
  }
}

