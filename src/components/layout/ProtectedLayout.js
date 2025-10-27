'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './sidebar'; // Your existing components
import { TopHeader } from './top-header';

export default function ProtectedLayout({ children }) {
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth state is determined and the user is NOT authenticated,
    // redirect them to the login page.
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  // If the user is authenticated, render the full app layout
  if (authStatus === 'authenticated') {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader />
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // While redirecting or if in an unexpected state, render nothing.
  // The AuthProvider already shows a loading spinner.
  return null;
}
