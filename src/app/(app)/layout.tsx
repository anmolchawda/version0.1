
// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId: (uid: string | null) => void;
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_profile' | 'authenticated_ready'>('loading');
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;
  const [error, setError] = useState<string | null>(null);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      setContextAuthUserId(user?.uid || null);

      // Clean up previous profile listener if it exists
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      if (!user) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (!db) {
        setError("Database connection error. Please try again later.");
        setAuthStatus('loading');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      
      profileUnsubscribeRef.current = onSnapshot(userDocRef, 
        (userDocSnap) => {
          if (userDocSnap.exists() && userDocSnap.data()?.profileSetupComplete) {
            setAuthStatus('authenticated_ready');
          } else {
            setAuthStatus('authenticated_needs_profile');
          }
        },
        (profileError) => {
          console.error("Error fetching user profile:", profileError);
          setError("Could not verify your profile status. Please try refreshing.");
          setAuthStatus('loading');
        }
      );
    });

    // Cleanup function for the effect.
    return () => {
      authUnsubscribe();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
    };
  }, [setContextAuthUserId]);


  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
      if (!isAuthPage) {
        router.replace('/login');
      }
    } else if (authStatus === 'authenticated_needs_profile') {
      const isSetupPage = pathname === '/settings/account';
      if (!isSetupPage) {
        router.replace('/settings/account');
      }
    }
  }, [authStatus, pathname, router]);

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-destructive">Application Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (authStatus === 'unauthenticated' && !pathname.startsWith('/login')) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  if (authStatus === 'authenticated_needs_profile' && pathname !== '/settings/account') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to profile setup...</p>
      </div>
    );
  }

  if (authStatus === 'authenticated_ready' || (authStatus === 'authenticated_needs_profile' && pathname === '/settings/account')) {
    return (
      <>
        <TopHeader />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20" 
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}
          <main
            className={cn(
              `flex-1 py-6 overflow-y-auto mb-16` 
            )}
          >
            <div className="max-w-2xl mx-auto px-4 h-full"> 
            {children}
            </div>
          </main>
        </div>
        <BottomNavBar />
      </>
    );
  }

  return null;
}

export default function AppPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
