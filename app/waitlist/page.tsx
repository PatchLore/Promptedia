import { Metadata } from 'next';
import WaitlistPageClient from './WaitlistPageClient';

export const metadata: Metadata = {
  title: 'Join Waitlist | OnPointPrompt — Pro Features Coming Soon',
  description: 'Join the waitlist to be notified when Pro features launch. Get early access to GPT-4o, Claude 3.5, and unlimited testing.',
  alternates: {
    canonical: 'https://www.onpointprompt.com/waitlist',
  },
  openGraph: {
    title: 'Join Waitlist | OnPointPrompt',
    description: 'Join the waitlist to be notified when Pro features launch.',
    url: 'https://www.onpointprompt.com/waitlist',
  },
};

export default function WaitlistPage() {
  return <WaitlistPageClient />;
}
