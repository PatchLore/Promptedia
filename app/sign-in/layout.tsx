import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - On Point Prompt',
  description: 'Sign in to On Point Prompt to access your favorites and personalized prompts',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

