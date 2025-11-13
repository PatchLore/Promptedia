import CreatePromptForm from '@/components/CreatePromptForm';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
const canonicalUrl = `${siteUrl}/create`;

export default function CreatePage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Create New Prompt',
    url: canonicalUrl,
    description:
      'Submit a new AI prompt to On Point Prompt and share your ideas with the community.',
  };

  const content = (
    <>
      <head>
        <title>Create an AI Prompt | On Point Prompt</title>
        <meta
          name="description"
          content="Submit a new AI prompt to On Point Prompt. Share your best ideas with the community and help others create amazing content."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Create an AI Prompt | On Point Prompt" />
        <meta
          property="og:description"
          content="Share your best AI prompts for image, music, writing, coding, and business tools with the On Point Prompt community."
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

      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <section className="mx-auto max-w-2xl py-8 space-y-6">
          <header>
            <h1 className="text-4xl font-bold mb-8 text-white">Create New Prompt</h1>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Share your best AI prompt with the community. Fill out the details below and submit to add it to the library.
            </p>
          </header>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-sm">
            <CreatePromptForm userId={null} />
          </div>
        </section>
      </div>
    </>
  );

  return <WrapperClient>{content}</WrapperClient>;
}