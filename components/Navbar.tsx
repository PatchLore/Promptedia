import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import AuthButton from './AuthButton';
import SearchBar from './SearchBar';

export default async function Navbar() {
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
              href="/packs"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Packs
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Favorites
              </Link>
            )}
            {user ? (
              <AuthButton user={user} />
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}



