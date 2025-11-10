export const dynamic = "force-dynamic";

import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import WrapperClient from '@/app/WrapperClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

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

  return (
    <WrapperClient>
      <>
        <head>
          <title>My Favorite Prompts | On Point Prompt</title>
          <meta
            name="description"
            content="Access your saved AI prompts in one place. Your favorite prompts stay synced across every device."
          />
          <link
            rel="canonical"
            href={`${siteUrl}/profile`}
          />
          <meta property="og:title" content="My Favorite Prompts | On Point Prompt" />
          <meta
            property="og:description"
            content="Review and manage your saved AI prompts, synced across devices when you sign in."
          />
          <meta property="og:url" content={`${siteUrl}/profile`} />
          <meta property="og:image" content={`${siteUrl}/og.png`} />
          <meta property="og:type" content="website" />
        </head>

        <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
          <header className="py-8">
            <h1 className="text-4xl font-bold mb-8 text-white">My Favorites</h1>
            <p className="text-gray-400 dark:text-gray-300 text-base leading-relaxed">
              Access your saved prompts in one place. Favorites stay in sync across devices as long as you&apos;re signed in.
            </p>
          </header>
          <ProfileClient promptIds={promptIds} />
        </div>
      </>
    </WrapperClient>
  );
}
