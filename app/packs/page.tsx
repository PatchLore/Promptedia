import WrapperClient from '@/app/WrapperClient';
import PackCard from '@/components/PackCard';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { promptPacks } from '@/lib/monetization';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/packs`;

export const metadata: Metadata = {
  title: 'Premium Prompt Packs | OnPointPrompt',
  description:
    'Discover curated AI prompt packs for writing, art, productivity, storytelling, and more.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Premium Prompt Packs | OnPointPrompt',
    description:
      'Discover curated AI prompt bundles for images, music, writing, coding, and business tasks. Unlock 100+ ready-to-use prompts instantly.',
    url: canonicalUrl,
    images: [`${siteUrl}/og.png`],
    type: 'website',
  },
};

type Pack = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string | null;
  price: string;
  url: string;
  created_at?: string | null;
};

export default async function PacksPage() {
  // Always start with static packs as fallback
  let packs: Pack[] = promptPacks.map((pack, index) => ({
    id: `static-${index}`,
    slug: pack.slug,
    title: pack.title,
    summary: pack.summary,
    price: pack.price,
    url: pack.url,
  }));

  // Try to load from Supabase if table exists (optional enhancement)
  // Wrap in try-catch to prevent any errors from causing route failures
  try {
    // Check if Supabase is configured before attempting query
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getSupabaseServerClient();
      // Use type assertion since packs table may not exist in database types yet
      const { data, error } = await (supabase as any)
        .from('packs')
        .select('*')
        .order('created_at', { ascending: false });

      // Only use Supabase data if there's no error and we have data
      if (!error && data && Array.isArray(data) && data.length > 0) {
        // Transform Supabase data to match PackCard expectations
        packs = data.map((pack: any) => ({
          id: pack.id,
          slug: pack.slug || pack.id,
          title: pack.title,
          summary: pack.summary || pack.description || '',
          description: pack.description,
          price: pack.price || '$0',
          url: pack.url || `/packs/${pack.slug || pack.id}`,
          created_at: pack.created_at,
        }));
      }
    }
  } catch (error: any) {
    // Supabase table doesn't exist or error occurred - use static data
    // This is expected and handled gracefully - never throw
    if (process.env.NODE_ENV === 'development') {
      console.log('[PacksPage] Using static packs data:', error?.message || 'Packs table not available');
    }
    // Continue with static packs - already set above
  }

  return (
    <WrapperClient>
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
            Premium AI Prompt Packs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Discover curated AI prompt bundles tailored for image generation, music creation, and
            high-impact ChatGPT workflows. Download ready-to-use prompts and accelerate your
            projects.
          </p>
        </div>

        {packs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No packs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        )}
      </main>
    </WrapperClient>
  );
}
