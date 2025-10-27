
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { NativeAuthHandler } from '@/components/auth/native-auth-handler';

export default function AppPagesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_language' | 'authenticated_needs_profile' | 'authenticated_ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
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
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (!userData.languageSelected) {
              setAuthStatus('authenticated_needs_language');
            } else if (!userData.profileSetupComplete) {
              setAuthStatus('authenticated_needs_profile');
            } else {
              setAuthStatus('authenticated_ready');
            }
          } else {
            setAuthStatus('authenticated_needs_language');
          }
        },
        (profileError) => {
          console.error("Error fetching user profile:", profileError);
          setError("Could not verify your profile status. Please try refreshing.");
          setAuthStatus('loading');
        }
      );
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
    if (authStatus === 'unauthenticated' && !isAuthPage) {
      router.replace('/login');
    } else if (authStatus === 'authenticated_needs_language' && pathname !== '/settings/language') {
      router.replace('/settings/language');
    } else if (authStatus === 'authenticated_needs_profile' && pathname !== '/settings/account') {
      router.replace('/settings/account');
    }
  }, [authStatus, pathname, router]);

  const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
  
  const isAllowedToRender = 
    authStatus === 'authenticated_ready' ||
    (authStatus === 'authenticated_needs_profile' && pathname === '/settings/account') ||
    (authStatus === 'authenticated_needs_language' && pathname === '/settings/language') ||
    isAuthPage;

  if (authStatus === 'loading' || !isAllowedToRender) {
    let message = "Authenticating...";
    if (authStatus === 'unauthenticated') message = "Redirecting to login...";
    if (authStatus === 'authenticated_needs_language') message = "Redirecting to language selection...";
    if (authStatus === 'authenticated_needs_profile') message = "Redirecting to profile setup...";

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{message}</p>
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
  
  return (
    <SidebarProvider>
      {/* NativeAuthHandler is ALWAYS present, no matter the page */}
      <NativeAuthHandler />

      {/* Main content area */}
      <div className="flex h-screen bg-background">
        {/* Conditionally render the sidebar if NOT on an auth page */}
        {!isAuthPage && <Sidebar />}
        
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Conditionally render the header if NOT on an auth page */}
          {!isAuthPage && <TopHeader />}

          {/* The actual page content is always rendered */}
          <div className="p-4 md:p-8">
            {children}
          </div>
          
          {/* Conditionally render the bottom nav if NOT on an auth page */}
          {!isAuthPage && <BottomNavBar />}
        </main>
      </div>
    </SidebarProvider>
  );
}
