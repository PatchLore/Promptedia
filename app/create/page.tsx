import CreatePromptForm from '@/components/CreatePromptForm';
import WrapperClient from '@/app/WrapperClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'Create Prompt | On Point Prompt',
  description: 'Submit a new AI prompt to the On Point Prompt library and share it with the community.',
  alternates: {
    canonical: `${siteUrl}/create`,
  },
  openGraph: {
    title: 'Create Prompt | On Point Prompt',
    description: 'Submit a new AI prompt to the On Point Prompt library and share it with the community.',
    url: `${siteUrl}/create`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

export default function CreatePage() {
  const content = (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={null} />
    </div>
  );

  return <WrapperClient>{content}</WrapperClient>;
}



