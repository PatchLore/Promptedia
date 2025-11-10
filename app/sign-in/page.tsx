export const dynamic = "force-dynamic";

import SignInClient from './SignInClient';
import WrapperClient from '@/app/WrapperClient';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'Sign In | On Point Prompt',
  description: 'Access your On Point Prompt account to manage favourites and premium content.',
  alternates: {
    canonical: `${siteUrl}/sign-in`,
  },
  openGraph: {
    title: 'Sign In | On Point Prompt',
    description: 'Access your On Point Prompt account to manage favourites and premium content.',
    url: `${siteUrl}/sign-in`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

export default function SignInPage() {
  const content = <SignInClient />;

  return <WrapperClient>{content}</WrapperClient>;
}

