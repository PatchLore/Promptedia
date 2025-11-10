export const dynamic = "force-dynamic";

import SignInClient from './SignInClient';
import WrapperClient from '@/app/WrapperClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/sign-in`;

export default function SignInPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sign In to On Point Prompt',
    url: canonicalUrl,
    description:
      'Sign in to manage your saved AI prompts and personalized creator tools on On Point Prompt.',
  };

  const content = (
    <>
      <head>
        <title>Sign In | On Point Prompt</title>
        <meta
          name="description"
          content="Sign in to On Point Prompt to access your saved prompts, manage favorites, and unlock creator tools."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Sign In | On Point Prompt" />
        <meta
          property="og:description"
          content="Access your On Point Prompt account to manage favorites and personalized AI prompts."
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

      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <section className="mx-auto max-w-md py-8 space-y-6">
          <header>
            <h1 className="text-4xl font-bold mb-8 text-white">Sign In</h1>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Access your saved prompts and creator tools. Sign in to keep your library synced.
            </p>
          </header>
          <SignInClient />
        </section>
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}