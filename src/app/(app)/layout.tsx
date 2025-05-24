// src/app/(app)/layout.tsx
'use client';

import { AppHeader } from '@/components/layout/app-header';
// BottomNavBar is removed
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isMockAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
    setIsLoading(false);

    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-background"> {/* Removed pb-16 md:pb-0 */}
        <div className="container mx-auto max-w-xl px-4 py-8">
         {children}
        </div>
      </main>
      {/* BottomNavBar removed from here */}
    </div>
  );
}
