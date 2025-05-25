// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isMockAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
    setIsLoadingAuth(false);

    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);


  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally not be reached if redirection in useEffect works,
    // but it's a fallback.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      {/* Minimal top-right messages icon */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/messages" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-card/80 hover:bg-card shadow-md backdrop-blur-sm">
            <MessageSquare className="h-5 w-5 text-primary" />
          </Button>
        </Link>
      </div>

      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 py-6 overflow-y-auto mb-16 ml-[72px] lg:ml-64">
          <div className="max-w-xl mx-auto px-4">
           {children}
          </div>
        </main>
      </div>
      <BottomNavBar />
    </>
  );
}
