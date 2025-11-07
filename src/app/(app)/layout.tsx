// src/app/(main)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Inner component to access context
function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();
  
  // --- All auth logic can remain the same ---
  const [authStatus, setAuthStatus] = useState('loading');
  const router = useRouter();
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) { setAuthStatus('unauthenticated'); return; }
      const userDocRef = doc(db, 'users', user.uid);
      onSnapshot(userDocRef, (docSnap) => {
        if(docSnap.exists()) setAuthStatus('authenticated_ready');
        else setAuthStatus('authenticated_needs_profile');
      });
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth');
    if (authStatus === 'unauthenticated' && !isAuthPage) router.replace('/login');
    if (authStatus === 'authenticated_needs_profile' && !pathname.startsWith('/settings')) router.replace('/settings/account');
  }, [authStatus, pathname, router]);
  if (authStatus === 'loading' || (authStatus !== 'authenticated_ready' && !pathname.startsWith('/settings') && !pathname.startsWith('/auth'))) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }
  // --- End of auth logic ---
  
  return (
    <div className="h-screen w-screen bg-background">
      {/* Fixed Top Header (z-index 40) */}
      <TopHeader />

      {/* 
        ========================================================================
        === FIX #2: DESKTOP SIDEBAR (Now with Scrolling)                     ===
        === This sidebar is always visible on medium screens and up (md).    ===
        ========================================================================
      */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background md:block">
        {/* The inner div has padding-top and allows its own content to scroll */}
        <div className="h-full overflow-y-auto pt-16">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content Area - has left padding on desktop to avoid the sidebar */}
      <main className="h-full w-full overflow-y-auto md:pl-64">
        {/* Padding to push content below header and above bottom nav */}
        <div className="pt-20 pb-20 px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* --- MOBILE-ONLY UI (SIDEBAR & BACKDROP) --- */}
      {/* Clickable backdrop (z-index 40) */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}
      
      {/* 
        ========================================================================
        === FIX #1: MOBILE SIDEBAR (Now starts below the header)            ===
        === It starts from `top-16` and takes the remaining screen height.   ===
        ========================================================================
      */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* This inner div can scroll if the content is too long for the screen */}
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Fixed Bottom Nav (z-index 40) - correctly hidden on desktop */}
      <BottomNavBar />
    </div>
  );
}

// Top-level export providing the context to the whole layout
export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}
