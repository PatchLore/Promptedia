import LoginForm from './LoginForm';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <WrapperClient>
      <LoginForm />
    </WrapperClient>
  );
}



