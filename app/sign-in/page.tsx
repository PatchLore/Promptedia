export const dynamic = "force-dynamic";

import SignInClient from './SignInClient';
import WrapperClient from '@/app/WrapperClient';

export default function SignInPage() {
  const content = <SignInClient />;

  return <WrapperClient>{content}</WrapperClient>;
}

