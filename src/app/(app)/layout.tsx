
// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { auth, db, doc, getDoc } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';

interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId: (uid: string | null) => void;
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  // Effect to subscribe to auth state changes. Runs only once.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (setContextAuthUserId) {
        setContextAuthUserId(user?.uid || null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [setContextAuthUserId]);

  // Effect to handle redirection based on auth state and profile completeness.
  // Runs when auth state is resolved or when path changes.
  useEffect(() => {
    if (isLoadingAuth) {
      return; // Don't do anything while auth is loading
    }

    if (currentUser) {
      // User is logged in, check profile status
      if (!db) {
        console.error("Firebase DB is not available. Cannot verify profile status.");
        setError("Database connection error. Please try again later.");
        return;
      }
      
      const checkProfileAndRedirect = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists() || !userDocSnap.data()?.profileSetupComplete) {
            // If profile doesn't exist or is incomplete, redirect to setup
            if (pathname !== '/setup-profile') {
              router.replace('/setup-profile');
            }
          } else {
            // If profile IS complete, but user tries to access setup, redirect to home
            if (pathname === '/setup-profile') {
              router.replace('/');
            }
          }
        } catch (profileError) {
          console.error("Error fetching user profile for redirection logic:", profileError);
          setError("Could not verify profile status. Please try again.");
        }
      };
      checkProfileAndRedirect();
    } else {
      // User is not logged in, redirect to login page if they aren't on an auth page
      const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
      if (!isAuthPage) {
        router.replace('/login');
      }
    }
  }, [currentUser, isLoadingAuth, pathname, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
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

  // If we are on an auth-related page (login, signup, setup-profile)
  // render it without the main app layout (Sidebar, TopHeader etc.)
  if (!currentUser || pathname === '/setup-profile') {
    // Show a loader while redirecting
    if (currentUser && pathname !== '/setup-profile') {
         return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verifying profile...</p>
          </div>
        );
    }
    // Render the children directly (which would be the login, signup, or setup-profile page)
    return <>{children}</>;
  }

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
