export const dynamic = "force-dynamic";

import SignInClient from './SignInClient';
import WrapperClient from '@/app/WrapperClient';

export const metadata = {
  title: 'Sign In - On Point Prompt',
  description: 'Access your account',
};

export default function SignInPage() {
  const content = <SignInClient />;

  return <WrapperClient>{content}</WrapperClient>;
}

