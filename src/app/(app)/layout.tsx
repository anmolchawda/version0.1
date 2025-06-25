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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  // Effect to subscribe to auth state changes. Runs only once.
  useEffect(() => {
    if (USE_MOCK_DATA) {
      console.log("[AppLayoutContent] Using MOCK_DATA mode for auth.");
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
      } else {
        setError("Mock user data not found. Cannot proceed.");
      }
      setIsLoadingAuth(false);
      return;
    }

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
         if (pathname === '/setup-profile') {
            router.replace('/');
          }
        return;
      }
      
      const checkProfileAndRedirect = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const userProfile = userDocSnap.exists() ? userDocSnap.data() : null;

          if (!userProfile?.profileSetupComplete) {
            if (pathname !== '/setup-profile' && !pathname.startsWith('/auth')) {
              router.replace('/setup-profile');
            }
          } else {
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
      // User is not logged in
      if (!pathname.startsWith('/auth') && pathname !== '/login' && pathname !== '/signup') {
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

  if (USE_MOCK_DATA && !currentUser) {
     return <div className="flex min-h-screen flex-col items-center justify-center bg-background"><p>Error: Mock user could not be loaded.</p></div>;
  }
  
  // If not in mock mode, and no current user, and not on auth pages (already handled by useEffect, but as a safeguard)
  if (!USE_MOCK_DATA && !currentUser && !pathname.startsWith('/auth') && pathname !=='/setup-profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // Allow access to login/signup pages
  if (!USE_MOCK_DATA && !currentUser && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
     return <>{children}</>;
  }

  // Specific handling for setup-profile page if logic above hasn't redirected yet
  // (e.g., user is authenticated but profile isn't complete)
  if (pathname === '/setup-profile') {
    // Ensure user is authenticated for this page if not in mock mode
    if (!USE_MOCK_DATA && !currentUser) {
       router.replace('/login'); 
       return  <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Redirecting...</p>
                </div>;
    }
    return <>{children}</>; // Allow access to setup-profile page
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
