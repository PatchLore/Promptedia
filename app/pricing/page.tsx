import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing | OnPointPrompt — AI Prompt Tester Plans',
  description: 'Choose the perfect plan for testing AI prompts. Free tier available with Gemini Flash. Upgrade to Pro for GPT-4o, Claude 3.5, and unlimited tests.',
  alternates: {
    canonical: 'https://www.onpointprompt.com/pricing',
  },
  openGraph: {
    title: 'Pricing | OnPointPrompt',
    description: 'Choose the perfect plan for testing AI prompts. Free tier available with Gemini Flash.',
    url: 'https://www.onpointprompt.com/pricing',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}

