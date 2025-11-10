import WrapperClient from '@/app/WrapperClient';
import { promptPacks } from '@/lib/monetization';
import LazyPacksClient from '@/components/LazyPacksClient';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/packs`;

export default function PacksPage() {
  const featuredPack = promptPacks[0];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Premium AI Prompt Packs',
    url: canonicalUrl,
    description:
      'Browse curated AI prompt packs for Midjourney, ChatGPT, Suno, Udio, and more creative tools.',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: featuredPack?.title ?? 'Premium AI Prompt Pack',
    description:
      featuredPack?.summary ??
      'Curated AI prompts designed to accelerate your creative workflow across popular tools.',
    image: `${siteUrl}/og.png`,
    offers: {
      '@type': 'Offer',
      price: featuredPack?.price?.replace(/[^0-9.]/g, '') || '10.00',
      priceCurrency: 'USD',
      url: featuredPack?.url ?? canonicalUrl,
      availability: 'https://schema.org/InStock',
    },
    url: canonicalUrl,
  };

  return (
    <WrapperClient>
      <>
        <head>
          <title>Premium Prompt Packs | On Point Prompt</title>
          <meta
            name="description"
            content="Browse premium AI prompt packs curated for Midjourney, ChatGPT, Suno, Udio, and more. Download ready-to-use prompts and accelerate your workflow."
          />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content="Premium Prompt Packs | On Point Prompt" />
          <meta
            property="og:description"
            content="Discover curated AI prompt bundles for images, music, writing, coding, and business tasks. Unlock 100+ ready-to-use prompts instantly."
          />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={`${siteUrl}/og.png`} />
          <meta property="og:type" content="website" />
        </head>

        <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
          <section className="mx-auto max-w-3xl py-8 space-y-6">
            <h1 className="text-4xl font-bold mb-8 text-white">Premium AI Prompt Packs</h1>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Discover AI prompt bundles tailored for image generation, music creation, and high-impact ChatGPT workflows. Download ready-to-use prompts and accelerate your projects.
            </p>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Each pack is curated by creators and constantly refined for the latest AI tools. Save time, unlock new ideas, and eliminate guesswork in your creative process.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              <li>Save time with curated prompt bundles</li>
              <li>Download 100+ prompts instantly</li>
              <li>Boost content creation with proven prompt formulas</li>
            </ul>
          </section>
          <section className="py-8">
          <LazyPacksClient />
          </section>
        </div>
      </>
    </WrapperClient>
  );
}

// PacksClient renders purchase CTAs; load it lazily to keep the shell hydration small.
