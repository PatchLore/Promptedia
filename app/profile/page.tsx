export const dynamic = "force-dynamic";

import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export const metadata = {
  title: 'My Favorites - On Point Prompt',
  description: 'View your saved favorite prompts',
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

  return (
    <PostHogProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{content}</main>
          <Footer />
        </div>
      </ToastProvider>
    </PostHogProvider>
  );
}
