import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AuthButton from './AuthButton';
import SearchBar from './SearchBar';

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            On Point Prompt
          </Link>
          
          <div className="flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/browse"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/create"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Create
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Favorites
              </Link>
            )}
            <AuthButton user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}



