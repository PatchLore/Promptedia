import WrapperClient from '@/app/WrapperClient';
import SearchPageClient from './SearchPageClient';

type SearchPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const initialQuery = searchParams?.q ?? '';

  return (
    <WrapperClient>
      <div className="container mx-auto px-4 py-12">
        <SearchPageClient initialQuery={initialQuery} />
      </div>
    </WrapperClient>
  );
}


