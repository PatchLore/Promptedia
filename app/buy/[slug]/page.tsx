import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getImageUrl } from '@/lib/getImageUrl';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

type BuyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BuyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: pack } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!pack) {
    return {
      title: 'Pack Not Found | OnPointPrompt',
    };
  }

  return {
    title: `Buy ${pack.title} | OnPointPrompt`,
    description: pack.description || `Purchase access to the ${pack.title} prompt pack.`,
    openGraph: {
      title: `Buy ${pack.title}`,
      description: pack.description || `Purchase access to the ${pack.title} prompt pack.`,
      url: `/buy/${slug}`,
      images: pack.image_url ? [pack.image_url] : [],
    },
  };
}

export default async function BuyPage({ params }: BuyPageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: pack, error } = await (supabase as any)
    .from('packs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !pack) {
    return (
      <WrapperClient>
        <div className="p-10 text-center">Pack not found.</div>
      </WrapperClient>
    );
  }

  // Format price - handle both numeric and string formats
  const formatPrice = (price: number | string | null | undefined): string => {
    if (typeof price === 'number') {
      return `£${price}`;
    }
    if (typeof price === 'string') {
      // If it already has a currency symbol, return as is
      if (price.startsWith('£') || price.startsWith('$')) {
        return price.replace('$', '£');
      }
      // If it's a number string, add £
      return `£${price}`;
    }
    return '£0';
  };

  const displayPrice = formatPrice(pack.price);

  return (
    <WrapperClient>
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-10">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Buy: {pack.title}
        </h1>

        <img
          src={getImageUrl(pack.image_url)}
          alt={pack.title}
          className="w-full h-auto rounded-xl shadow"
        />

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          {pack.description}
        </p>

        {/* Checkout Box */}
        <section className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Order Summary
          </h2>

          <div className="flex justify-between text-lg mb-4 text-gray-900 dark:text-white">
            <span>{pack.title}</span>
            <span className="font-semibold">{displayPrice}</span>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition font-medium">
            Complete Purchase
          </button>
        </section>

        <Link
          href={`/packs/${pack.slug}`}
          className="text-blue-600 hover:underline text-sm inline-block"
        >
          ← Back to Pack
        </Link>
      </main>
    </WrapperClient>
  );
}
