import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/auth/auth-code-error`;

export default function AuthCodeError() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Authentication Error',
    url: canonicalUrl,
    description: 'An error occurred while signing in to On Point Prompt.',
  };

  return (
    <WrapperClient>
      <>
        <head>
          <title>Authentication Error | On Point Prompt</title>
          <meta
            name="description"
            content="There was an error signing you in. Please try again."
          />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content="Authentication Error | On Point Prompt" />
          <meta
            property="og:description"
            content="There was an error signing you in. Please try again."
          />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={`${siteUrl}/og.png`} />
          <meta property="og:type" content="website" />
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
        </head>

        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            There was an error signing you in. Please try again.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            Return Home
          </Link>
        </div>
      </>
    </WrapperClient>
  );
}
