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
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Assume complete to avoid flicker
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  // Effect 1: Handle Auth State - runs once on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (setContextAuthUserId) {
        setContextAuthUserId(user?.uid || null);
      }
      setIsLoading(false); // Auth state is resolved, stop initial loading.
    });
    return () => unsubscribe();
  }, [setContextAuthUserId]);

  // Effect 2: Verify Profile and Redirect - runs when auth state or navigation changes
  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth to be checked first
    }

    if (!currentUser) {
      const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
      if (!isAuthPage) {
        router.replace('/login');
      }
      return;
    }
    
    // User is logged in, check their profile status
    const verifyProfile = async () => {
      if (!db) {
        setError("Database connection error. Please try again later.");
        return;
      }
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const profileIsComplete = userDocSnap.exists() && !!userDocSnap.data()?.profileSetupComplete;
        
        setIsProfileComplete(profileIsComplete); // Update the state

        const isAllowedPath = pathname.startsWith('/settings') || pathname === '/setup-profile';
        if (!profileIsComplete && !isAllowedPath) {
          router.replace('/settings/account');
        }
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        setError("Could not verify profile status. Please try again.");
        setIsProfileComplete(false); // Assume incomplete on error
      }
    };

    verifyProfile();

  }, [currentUser, isLoading, pathname, router]);

  if (isLoading) {
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
  
  if (!currentUser) {
    // This state is hit while the redirect to /login is in progress
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // Gatekeeper check: if profile is incomplete AND user is trying to access a protected page, show a loader
  const isAllowedPathForIncompleteProfile = pathname.startsWith('/settings') || pathname === '/setup-profile';
  if (!isProfileComplete && !isAllowedPathForIncompleteProfile) {
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
