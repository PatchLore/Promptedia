export const dynamic = "force-dynamic";

import WrapperClient from '@/app/WrapperClient';
import LazyProfileClient from './LazyProfileClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/profile`;

export default function ProfilePage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'My Favorite Prompts',
    url: canonicalUrl,
    description:
      'View and manage your saved AI prompts on On Point Prompt. Favorites stay synced across devices when you sign in.',
  };

  return (
    <WrapperClient>
      <>
        <head>
          <title>My Favorite Prompts | On Point Prompt</title>
          <meta
            name="description"
            content="Access your saved AI prompts in one place. Your favorite prompts stay synced across every device."
          />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content="My Favorite Prompts | On Point Prompt" />
          <meta
            property="og:description"
            content="Review and manage your saved AI prompts, synced across devices when you sign in."
          />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || 'https://placehold.co/600x400?text=Image'} />
          <meta property="og:type" content="website" />
        </head>

        <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />

          <header className="py-8">
            <h1 className="text-4xl font-bold mb-8 text-white">My Favorites</h1>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Access your saved prompts in one place. Favorites stay in sync across devices as long as you&apos;re signed in.
            </p>
          </header>
          <LazyProfileClient />
        </div>
      </>
    </WrapperClient>
  );
}
