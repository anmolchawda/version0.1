// src/app/(main)/layout.tsx

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

// Inner component to access sidebar context
function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_language' | 'authenticated_needs_profile' | 'authenticated_ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();

  // --- All your authentication useEffect hooks remain unchanged ---
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (profileUnsubscribeRef.current) profileUnsubscribeRef.current();
      if (!user) { setAuthStatus('unauthenticated'); return; }
      if (!db) { setError("Database connection error."); setAuthStatus('loading'); return; }
      const userDocRef = doc(db, 'users', user.uid);
      profileUnsubscribeRef.current = onSnapshot(userDocRef, (userDocSnap) => {
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (!userData.languageSelected) setAuthStatus('authenticated_needs_language');
          else if (!userData.profileSetupComplete) setAuthStatus('authenticated_needs_profile');
          else setAuthStatus('authenticated_ready');
        } else { setAuthStatus('authenticated_needs_language'); }
      }, (profileError) => {
        console.error("Error fetching user profile:", profileError);
        setError("Could not verify your profile status.");
        setAuthStatus('loading');
      });
    });
    return () => { authUnsubscribe(); if (profileUnsubscribeRef.current) profileUnsubscribeRef.current(); };
  }, []);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
    if (authStatus === 'unauthenticated' && !isAuthPage) router.replace('/login');
    else if (authStatus === 'authenticated_needs_language' && pathname !== '/settings/language') router.replace('/settings/language');
    else if (authStatus === 'authenticated_needs_profile' && pathname !== '/settings/account') router.replace('/settings/account');
  }, [authStatus, pathname, router]);

  const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
  const isAllowedToRender = authStatus === 'authenticated_ready' || (authStatus === 'authenticated_needs_profile' && pathname === '/settings/account') || (authStatus === 'authenticated_needs_language' && pathname === '/settings/language') || isAuthPage;

  if (authStatus === 'loading' || !isAllowedToRender) {
    let message = "Authenticating...";
    if (authStatus === 'unauthenticated') message = "Redirecting to login...";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    );
  }
  
  if (isAuthPage) { return <main>{children}</main>; }

  return (
    <div className="h-screen w-screen bg-background">
      {/* 
        ========================================================================
        === FIX: The TopHeader is now a sibling, not a child of the layout.  ===
        === Its high z-index (z-40) keeps it on top of everything.         ===
        ========================================================================
      */}
      <TopHeader />

      {/* Main Content Area */}
      <main className="h-full w-full overflow-y-auto">
        {/* 
          ========================================================================
          === FIX: Padding-top is now on the content *inside* the scroll area. ===
          === This pushes the first post down just enough, eliminating the gap.===
          ========================================================================
        */}
        <div className="pt-20 pb-20 px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* Clickable backdrop for closing the sidebar */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      {/* 
        ========================================================================
        === FIX: The sidebar now has a z-index of 50 (highest) and a solid   ===
        === background color, starting below the header (`top-16`).        ===
        ========================================================================
      */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </aside>

      <BottomNavBar />
    </div>
  );
}

// The top-level export that provides the context
export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}
