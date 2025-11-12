import WrapperClient from '@/app/WrapperClient';
import SearchPageClient from './SearchPageClient';

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params?.q ?? '';

  return (
    <WrapperClient>
      <div className="container mx-auto px-4 py-12">
        <SearchPageClient initialQuery={initialQuery} />
      </div>
    </WrapperClient>
  );
}


