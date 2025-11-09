export const dynamic = "force-dynamic";

import SignInClient from './SignInClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export const metadata = {
  title: 'Sign In - On Point Prompt',
  description: 'Access your account',
};

export default function SignInPage() {
  const content = <SignInClient />;

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

