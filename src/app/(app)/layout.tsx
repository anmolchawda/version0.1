// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar'; // Import BottomNavBar
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
    <>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto pb-20"> {/* Added pb-20 for bottom nav space */}
          <div className="max-w-xl mx-auto"> 
           {children}
          </div>
        </main>
      </div>
      <BottomNavBar />
    </>
  );
}
