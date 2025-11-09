import CreatePromptForm from '@/components/CreatePromptForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import PostHogProvider from '@/providers/PostHogProvider';

export const dynamic = 'force-dynamic';

export default function CreatePage() {
  const content = (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>
      <CreatePromptForm userId={null} />
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



