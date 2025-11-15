'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isPublicRoute } from '@/lib/publicRoutes';
import AuthButton from './AuthButton';
import SearchBar from './SearchBar';

type User = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
    console.log('[Navbar] Mounted', { pathname: currentPathname });
    return () => {
      const currentPathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
      console.log('[Navbar] Unmounted', { pathname: currentPathname });
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      // Guard: Don't redirect if we're on a public route (packs, prompts detail, etc.)
      if (pathname && isPublicRoute(pathname)) {
        // Only redirect if there's actually a query to search
        if (!query) {
          return; // Stay on current page if no query
        }
      }
      
      if (!query) {
        // Only redirect to browse if not already on a public route
        if (!pathname || !isPublicRoute(pathname)) {
          router.push('/browse');
        }
        return;
      }
      
      const params = new URLSearchParams({ search: query });
      router.push(`/browse?${params.toString()}`);
    },
    [router, pathname],
  );

  // Helper function to check if a route is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Nav link component with active state
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = isActive(href);
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Ensure navigation works correctly, especially for /radio
      if (href === '/radio') {
        e.stopPropagation();
      }
    };
    return (
      <Link
        href={href}
        prefetch={true}
        onClick={handleClick}
        className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline inline-flex items-center ${
          active
            ? 'text-gray-900 dark:text-white font-semibold underline'
            : ''
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Branding - Left aligned */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            On Point Prompt
          </Link>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <SearchBar onChange={handleSearch} placeholder="Search the library..." />
          </div>

          {/* Nav Links - Right side */}
          <div className="flex items-center space-x-6">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/prompts">Browse</NavLink>
              <NavLink href="/browse">Categories</NavLink>
              <NavLink href="/packs">Packs</NavLink>
              <NavLink href="/radio">🎧 Radio</NavLink>
              {user && <NavLink href="/profile">Favorites</NavLink>}
            </nav>

            {/* Mobile Search Icon - Show on mobile */}
            <div className="md:hidden">
              <SearchBar onChange={handleSearch} placeholder="Search..." />
            </div>

            {/* Auth Section */}
            <div className="flex items-center">
              {user ? (
                <AuthButton user={user} />
              ) : (
                <Link
                  href="/sign-in"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Links - Stacked below on mobile */}
        <div className="md:hidden mt-4 pb-2 flex flex-wrap gap-4">
          <NavLink href="/prompts">Browse</NavLink>
          <NavLink href="/browse">Categories</NavLink>
          <NavLink href="/packs">Packs</NavLink>
          <NavLink href="/radio">🎧 Radio</NavLink>
          {user && <NavLink href="/profile">Favorites</NavLink>}
        </div>
      </div>
    </nav>
  );
}



