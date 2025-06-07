
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
// Firebase direct imports are removed or will be conditionally used
// import { auth, db, doc, getDoc, setDoc, serverTimestamp } from '@/lib/firebase';
// import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import type { User as FirebaseUser } from 'firebase/auth'; // Keep type for mock user structure
import { MOCK_USER_ID, getPlaceholderUser } from '@/lib/placeholders'; // Import mock user data

interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId?: (uid: string | null) => void;
}

const USE_MOCK_DATA = true; // Master switch, should ideally be an env variable

function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // Use FirebaseUser type for mock
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  useEffect(() => {
    if (USE_MOCK_DATA) {
      console.log("[AppLayoutContent] Using MOCK_DATA mode for auth.");
      const mockUserData = getPlaceholderUser(MOCK_USER_ID);
      if (mockUserData) {
        // Simulate a FirebaseUser object
        const mockFirebaseUser: FirebaseUser = {
          uid: mockUserData.id,
          email: mockUserData.email || `${mockUserData.username}@example.com`,
          displayName: mockUserData.name || mockUserData.username,
          photoURL: mockUserData.avatarUrl || null,
          // Add other required FirebaseUser properties as null or default
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          providerId: 'mock',
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
        };
        setCurrentUser(mockFirebaseUser);
        if (setContextAuthUserId) {
          setContextAuthUserId(mockFirebaseUser.uid);
        }
        // Assume profile is always set up in mock mode to avoid /setup-profile redirect
        if (pathname === '/setup-profile') {
          router.replace('/feed');
        }
      } else {
        setError("Mock user data not found. Cannot proceed.");
      }
      setIsLoadingAuth(false);
    } else {
      // Original Firebase Auth logic would go here
      // const unsubscribe = onAuthStateChanged(auth, async (user) => { ... });
      // return () => unsubscribe();
      console.error("Firebase Auth logic is disabled as USE_MOCK_DATA is false but not implemented here for this specific change. Please ensure Firebase is correctly initialized if not using mock data.");
      setError("Authentication system not configured for non-mock mode in this version.");
      setIsLoadingAuth(false);
    }
  }, [router, setContextAuthUserId, pathname]);

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

  // If in mock mode and currentUser is set, proceed.
  // If not in mock mode, original Firebase logic would redirect if !currentUser.
  if (USE_MOCK_DATA && !currentUser) {
     // This case should ideally not be hit if mockUser is found
     return <div className="flex min-h-screen flex-col items-center justify-center bg-background"><p>Error: Mock user could not be loaded.</p></div>;
  }

  // Allow access to login/signup pages even if using mock data for the main app,
  // as the user might want to see these pages.
  if (!USE_MOCK_DATA && !currentUser && !pathname.startsWith('/auth') && pathname !=='/setup-profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  if (!USE_MOCK_DATA && !currentUser && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
     return <>{children}</>;
  }

  // In mock mode, /setup-profile should be skipped if we assume profile is complete.
  // The useEffect above already handles redirecting from /setup-profile to /feed in mock mode.
  if (pathname === '/setup-profile' && !USE_MOCK_DATA) {
    if (!currentUser && !pathname.startsWith('/auth')) {
       router.replace('/login'); 
       return  <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Redirecting...</p>
                </div>;
    }
    return <>{children}</>;
  }


  if (!USE_MOCK_DATA && !currentUser) {
     return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
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
