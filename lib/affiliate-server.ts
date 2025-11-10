import { Affiliate, getDefaultAffiliate } from './affiliate';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Server-side version of pickAffiliateForCategory for use in Server Components.
 */
export async function pickAffiliateForCategoryServer(
  category?: string
): Promise<Affiliate | null> {
  const supabase = getSupabaseServerClient();

  if (!category) {
    return getDefaultAffiliate();
  }

  try {
    // Normalize category to lowercase for matching
    const categoryLower = category.toLowerCase();

    // Fetch all active affiliates
    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select(
        'id, name, category, affiliate_url, commission_value, commission_type, cookie_days, is_active, created_at'
      )
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
    console.error('Error in pickAffiliateForCategoryServer:', error);
    return getDefaultAffiliate();
  }
}

