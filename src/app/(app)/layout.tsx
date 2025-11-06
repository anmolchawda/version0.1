// src/app/(main)/layout.tsx  (or wherever this file is located)
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// This is the inner component that can now access the sidebar context
function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_language' | 'authenticated_needs_profile' | 'authenticated_ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  // Grab sidebar state and toggle function from our context
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();

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
            if (!userData.languageSelected) setAuthStatus('authenticated_needs_language');
            else if (!userData.profileSetupComplete) setAuthStatus('authenticated_needs_profile');
            else setAuthStatus('authenticated_ready');
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
      if (profileUnsubscribeRef.current) profileUnsubscribeRef.current();
    };
  }, []);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
    if (authStatus === 'unauthenticated' && !isAuthPage) router.replace('/login');
    else if (authStatus === 'authenticated_needs_language' && pathname !== '/settings/language') router.replace('/settings/language');
    else if (authStatus === 'authenticated_needs_profile' && pathname !== '/settings/account') router.replace('/settings/account');
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
        <Button onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
      </div>
    );
  }

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </aside>

      {/* Main content container */}
      <div className="flex h-full flex-col">
        {/* The TopHeader is absolutely positioned now, so it doesn't take up layout space */}
        <TopHeader />
        
        {/* 
          ======================================================================
          === THE FIX IS HERE: We've removed "pt-16" from this line.         ===
          ======================================================================
        */}
        <main className="flex-1 overflow-y-auto pb-16">
          {/* We add the padding here to push content below the header */}
          <div className="pt-20 p-4 md:p-8"> 
            {children}
          </div>
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}

// The top-level export now wraps everything in the SidebarProvider
export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}
