import PacksClient from '@/components/PacksClient';
import WrapperClient from '@/app/WrapperClient';

export const dynamic = 'force-dynamic';

export default function PacksPage() {
  return (
    <WrapperClient>
      <PacksClient />
    </WrapperClient>
  );
}


