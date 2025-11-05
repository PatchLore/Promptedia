'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminAuthCheckProps = {
  children: React.ReactNode;
};

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('admin_session');
    
    if (adminSession === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}



