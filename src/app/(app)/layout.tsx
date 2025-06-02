
// src/app/(app)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'; // Import onAuthStateChanged

// Define a new type for the context that includes setContextAuthUserId
interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId?: (uid: string | null) => void;
}


function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (setContextAuthUserId) {
        setContextAuthUserId(user ? user.uid : null);
      }
      setIsLoadingAuth(false);
      if (!user && !pathname.startsWith('/auth')) { // Ensure we don't redirect if already on an auth page
         router.push('/login');
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, setContextAuthUserId]);

  // Get current pathname to avoid redirect loop if already on login page
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';


  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!currentUser && !pathname.startsWith('/auth')) { // Added check for auth pages
    // This case should ideally be handled by the onAuthStateChanged redirect,
    // but kept as a fallback or for scenarios where routing happens before auth state is fully processed.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // If there's a user, or if we are on an auth page (e.g. /login itself, and loading is done), render the app or children
   if (!currentUser && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    // Allow rendering of login/signup pages if user is not authenticated
     return <>{children}</>;
  }

  if (!currentUser) {
    // If still no user and not on auth pages (should be caught by redirect earlier)
    // This is an additional safety net
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
