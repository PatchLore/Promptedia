export const dynamic = "force-dynamic";

import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import WrapperClient from '@/app/WrapperClient';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

export const metadata: Metadata = {
  title: 'My Favorites | On Point Prompt',
  description: 'View and manage your saved favourite AI prompts on On Point Prompt.',
  alternates: {
    canonical: `${siteUrl}/profile`,
  },
  openGraph: {
    title: 'My Favorites | On Point Prompt',
    description: 'View and manage your saved favourite AI prompts on On Point Prompt.',
    url: `${siteUrl}/profile`,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

export default async function ProfilePage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('prompt_id')
    .eq('user_id', user.id);

  const promptIds = (favorites || [])
    .map((fav) => fav.prompt_id)
    .filter((id): id is string => Boolean(id));

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Favorites</h1>
      <ProfileClient promptIds={promptIds} />
    </div>
  );

  return <WrapperClient>{content}</WrapperClient>;
}
