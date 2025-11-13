export const dynamic = 'force-dynamic';

import WrapperClient from '@/app/WrapperClient';
import LoginForm from './LoginForm';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/admin/login`;

export default function AdminLoginPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Admin Login',
    url: canonicalUrl,
    description: 'Sign in to the On Point Prompt admin dashboard.',
  };

  return (
    <WrapperClient>
      <>
        <head>
          <title>Admin Login | On Point Prompt</title>
          <meta
            name="description"
            content="Enter the admin password to manage prompts and site content."
          />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content="Admin Login | On Point Prompt" />
          <meta
            property="og:description"
            content="Enter the admin password to manage prompts and site content."
          />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || 'https://placehold.co/600x400?text=Image'} />
          <meta property="og:type" content="website" />
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
        </head>
        <div className="container mx-auto px-4 py-16">
          <LoginForm />
        </div>
      </>
    </WrapperClient>
  );
}
