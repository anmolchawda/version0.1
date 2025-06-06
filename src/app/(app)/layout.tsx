
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
import { auth, db, doc, getDoc, setDoc, serverTimestamp } from '@/lib/firebase'; // Removed getFirestore from here
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';

interface AppSidebarContextType extends ReturnType<typeof useSidebarContext> {
  setContextAuthUserId?: (uid: string | null) => void;
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar, setContextAuthUserId } = useSidebarContext() as AppSidebarContextType;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null);
      if (user) {
        setCurrentUser(user);
        if (setContextAuthUserId) {
          setContextAuthUserId(user.uid);
        }

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          // Removed the problematic isFirestoreOffline check
          // The try-catch around getDoc and setDoc will handle actual Firestore errors (including offline if not cached)

          if (userDocSnap.exists() && userDocSnap.data()?.profileSetupComplete) {
            if (pathname === '/setup-profile') {
              router.replace('/feed');
            }
          } else {
            if (!userDocSnap.exists()) {
              console.log(`User document for ${user.uid} does not exist. Attempting to create initial document.`);
              try {
                await setDoc(userDocRef, {
                  id: user.uid,
                  username: user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`,
                  name: user.displayName || '',
                  email: user.email,
                  avatarUrl: user.photoURL || '',
                  profileSetupComplete: false,
                  createdAt: serverTimestamp(),
                  followersCount: 0,
                  followingCount: 0,
                  postCount: 0,
                }, { merge: true });
                console.log(`Initial document created for ${user.uid}. Redirecting to /setup-profile.`);
              } catch (e: any) {
                console.error("Error creating initial user doc in Firestore:", e.message, e);
                setError(
                  "Failed to initialize user profile. Please check your browser console for more details, then try again."
                );
                setIsLoadingAuth(false);
                return;
              }
            }
            if (pathname !== '/setup-profile' && pathname !== '/login' && pathname !== '/signup') {
              router.replace('/setup-profile');
            }
          }
        } catch (e: any) {
          console.error("Error fetching user document from Firestore:", e.message, e); 
          setError(
            "Failed to load user data. Please check your internet connection or browser console for more details, then try again."
          );
        } finally {
          setIsLoadingAuth(false);
        }
      } else {
        setCurrentUser(null);
        if (setContextAuthUserId) {
          setContextAuthUserId(null);
        }
        if (!pathname.startsWith('/auth') && pathname !== '/setup-profile') {
           router.replace('/login');
        }
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
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

  if (!currentUser && !pathname.startsWith('/auth') && pathname !=='/setup-profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
   if (!currentUser && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
     return <>{children}</>;
  }

  if (pathname === '/setup-profile') {
    if (!currentUser && !pathname.startsWith('/auth')) {
       router.replace('/login'); 
       return  <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Redirecting...</p>
                </div>;
    }
    return <>{children}</>;
  }

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
