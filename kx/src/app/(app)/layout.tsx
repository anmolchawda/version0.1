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
import { auth, db, doc, getDoc } from '@/lib/firebase'; // db can be null
import type { User as FirebaseUser } from 'firebase/auth';
import { MOCK_USER_ID, getPlaceholderUser } from '@/lib/placeholders';
import { Button } from '@/components/ui/button';

interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId?: (uid: string | null) => void;
}

const USE_MOCK_DATA = auth === null; // Determine mock mode based on auth instance

function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Handle auth state and fetch profile ONCE on change
  useEffect(() => {
    if (USE_MOCK_DATA) {
      const mockUserData = getPlaceholderUser(MOCK_USER_ID);
      if (mockUserData) {
        const mockFirebaseUser: FirebaseUser = {
          uid: mockUserData.id,
          email: mockUserData.email || `${mockUserData.username}@example.com`,
          displayName: mockUserData.name || mockUserData.username,
          photoURL: mockUserData.avatarUrl || null,
          emailVerified: true, isAnonymous: false, metadata: {}, providerData: [],
          providerId: 'mock', refreshToken: '', tenantId: null, delete: async () => {},
          getIdToken: async () => '', getIdTokenResult: async () => ({} as any),
          reload: async () => {}, toJSON: () => ({}),
        };
        setCurrentUser(mockFirebaseUser);
        if (setContextAuthUserId) {
          setContextAuthUserId(mockFirebaseUser.uid);
        }
        setIsProfileComplete(true); // Assume mock user's profile is complete
      } else {
        setError("Mock user data not found. Cannot proceed.");
      }
      setIsLoadingAuth(false);
      return; // No need for unsubscribe in mock mode
    }

    // Real Firebase Auth logic
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (setContextAuthUserId) {
        setContextAuthUserId(user?.uid || null);
      }

      if (user) {
        if (!db) {
          setError("Application configuration error. Cannot verify profile status.");
          setIsLoadingAuth(false);
          return;
        }
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          setIsProfileComplete(userDocSnap.exists() && !!userDocSnap.data()?.profileSetupComplete);
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Could not verify profile status. Please try again.");
          setIsProfileComplete(false); // Assume incomplete on error
        }
      } else {
        // Not logged in, so profile is not complete
        setIsProfileComplete(false);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [setContextAuthUserId]);

  // Effect 2: Handle redirection logic based on state
  useEffect(() => {
    if (isLoadingAuth) {
      return; // Wait until initial auth check is done
    }

    if (!currentUser) {
      // Not logged in, redirect to login page (auth pages are outside this layout)
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        router.replace('/login');
      }
    } else {
      // Logged in
      if (isProfileComplete) {
        if (pathname === '/setup-profile') {
          router.replace('/');
        }
      } else {
        if (pathname !== '/setup-profile') {
          router.replace('/setup-profile');
        }
      }
    }
  }, [isLoadingAuth, currentUser, isProfileComplete, pathname, router]);


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
  
  // This case handles a logged-out user mid-session before the redirect effect kicks in,
  // or the brief moment when a user needs to be redirected to/from the setup page.
  // Showing a loader prevents a flash of incorrect content.
  if (!currentUser || (currentUser && (isProfileComplete ? pathname === '/setup-profile' : pathname !== '/setup-profile'))) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Redirecting...</p>
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
