'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth state is determined and the user is NOT authenticated,
    // redirect them to the login page.
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  // If the user is authenticated, render the full app layout.
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

  // While checking auth or if unauthenticated and redirecting, render nothing here.
  // The AuthProvider will show a loading spinner.
  return null;
}
