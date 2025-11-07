
// src/app/(main)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');

  // --- Auth Flow (No changes here) ---
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth');
    if (authStatus === 'unauthenticated' && !isAuthPage) {
      router.replace('/login');
    }
  }, [authStatus, pathname, router]);
  // --- End Auth Flow ---

  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    // The screen is a flex container for the desktop layout
    <div className="h-screen w-screen bg-background md:flex">
      {/* 1. DESKTOP-ONLY SIDEBAR */}
      <aside className="hidden h-full w-64 flex-shrink-0 border-r bg-background md:block">
        <Sidebar />
      </aside>

      {/* 
        This is the main container for the mobile view.
        - `flex-col` stacks its children vertically.
        - `h-full` ensures it takes up the full screen height.
      */}
      <div className="flex h-full w-full flex-col">
        {/* Item 1: The Header. It is NOT an overlay. */}
        <TopHeader />

        {/* 
          Item 2: The Main Content.
          - `flex-1` makes it grow to fill ALL available remaining space.
          - `overflow-y-auto` makes ONLY this section scrollable.
          - `id="main-scroll-area"` allows child components to find and listen to it.
        */}
        <main id="main-scroll-area" className="flex-1 overflow-y-auto">
          {/* We add padding here for aesthetics, not for layout. */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Item 3: The Bottom Nav. Only on mobile. */}
        <div className="md:hidden">
          <BottomNavBar />
        </div>
      </div>

      {/* MOBILE-ONLY DRAWER & BACKDROP */}
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 transform bg-background transition-transform md:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </aside>
    </div>
  );
}

// The top-level export that provides the context (No changes)
export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}
