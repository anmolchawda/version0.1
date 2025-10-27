// src/app/(app)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';

export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authStatus } = useAuth();

  // EFFECT 1: Redirect unauthenticated users
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  // RENDER LOGIC
  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the full app UI shell and the page content inside it.
  if (authStatus === 'authenticated') {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader />
          <div className="p-4 md:p-8 flex-1">{children}</div> {/* The page content goes here */}
          <BottomNavBar />
        </main>
      </div>
    );
  }

  // While redirecting or in another state, render nothing.
  return null;
}
