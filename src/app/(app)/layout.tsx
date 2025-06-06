
// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { Loader2 } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { auth, db, doc, getDoc, setDoc, serverTimestamp } from '@/lib/firebase'; // Import Firebase auth, db, doc, getDoc, setDoc, serverTimestamp
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'; // Import onAuthStateChanged

// Define a new type for the context that includes setContextAuthUserId
interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId?: (uid: string | null) => void;
}


function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        if (setContextAuthUserId) {
          setContextAuthUserId(user.uid);
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data()?.profileSetupComplete) {
          // Profile is set up, allow access to the app
          if (pathname === '/setup-profile') {
            router.replace('/feed'); // Redirect from setup if already complete
          }
          setIsLoadingAuth(false);
        } else {
          // Profile not set up or document doesn't exist
          if (!userDocSnap.exists()) {
            // Create a basic user doc if it doesn't exist
            try {
              await setDoc(userDocRef, {
                id: user.uid,
                username: user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`,
                name: user.displayName || '',
                email: user.email,
                avatarUrl: user.photoURL || '',
                profileSetupComplete: false, // Explicitly false
                createdAt: serverTimestamp(),
              }, { merge: true });
            } catch (e) {
              console.error("Error creating initial user doc:", e);
              // Potentially logout or show error
            }
          }
          // Redirect to setup profile if not already there
          if (pathname !== '/setup-profile' && pathname !== '/login' && pathname !== '/signup') { // Avoid redirect from setup or auth pages
            router.replace('/setup-profile');
          }
          setIsLoadingAuth(false);
        }
      } else {
        // No user
        setCurrentUser(null);
        if (setContextAuthUserId) {
          setContextAuthUserId(null);
        }
        if (!pathname.startsWith('/auth') && pathname !== '/setup-profile') { // Avoid redirect loops
           router.replace('/login');
        }
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, setContextAuthUserId, pathname]);


  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  // If setup is not complete and user is trying to access other pages,
  // they will be redirected by the effect above.
  // If they are on /setup-profile, children (SetupProfilePage) will render.
  // If auth is still loading or user is null and not on an auth page, this covers it.
  if (!currentUser && !pathname.startsWith('/auth') && pathname !=='/setup-profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // Allow rendering of login/signup pages if user is not authenticated
   if (!currentUser && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
     return <>{children}</>;
  }

  // Allow rendering setup-profile page
  if (pathname === '/setup-profile') {
    return <>{children}</>;
  }

  // If still no user and not on auth pages (should be caught by redirect earlier)
  if (!currentUser) {
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
      <div className="flex min-h-screen pt-16"> {/* pt-16 for TopHeader height */}
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
