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
  const [isLoading, setIsLoading] = useState(true); // Combined loading state
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (setContextAuthUserId) {
        setContextAuthUserId(user?.uid || null);
      }

      if (user) {
        if (!db) {
          console.error("Firebase DB is not available. Cannot verify profile status.");
          setError("Database connection error. Please try again later.");
          setIsLoading(false);
          return;
        }
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const profileComplete = userDocSnap.exists() && !!userDocSnap.data()?.profileSetupComplete;
          setIsProfileComplete(profileComplete);

          // If profile is incomplete, and we are not on a settings page or the deprecated setup page, redirect.
          const isAllowedPath = pathname.startsWith('/settings') || pathname === '/setup-profile';
          if (!profileComplete && !isAllowedPath) {
            router.replace('/settings/account');
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Could not verify profile status. Please try again.");
        }
      } else {
        // No user, redirect to login if not on an auth page
        const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
        if (!isAuthPage) {
          router.replace('/login');
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [pathname, router, setContextAuthUserId]); // Pathname dependency ensures re-check on navigation

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying profile...</p>
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
  
  // If user is not logged in, auth pages have their own layout. 
  // The redirect in useEffect will handle unauthenticated users trying to access app pages.
  // While redirecting, the loader above will show.
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // If profile is not complete, but user is trying to access a non-settings page, show a loader while redirecting.
  // The useEffect handles the actual redirection logic.
  if (!isProfileComplete && !pathname.startsWith('/settings') && pathname !== '/setup-profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to profile setup...</p>
      </div>
    );
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
