
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

  // --- Auth Flow ---
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

  // =========================================================================
  // === THE LOGIC FOR THE FIX IS HERE                                    ===
  // =========================================================================
  const isFeedPage = pathname === '/feed' || pathname === '/';

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* 
        The TopHeader is now positioned conditionally.
        - On the feed page, it's 'absolute' so it can scroll away.
        - On all other pages, it's 'fixed' so it stays at the top.
      */}
      <div className={cn(
        "left-0 right-0 top-0 z-40 w-full",
        isFeedPage ? 'absolute' : 'fixed'
      )}>
        <TopHeader />
      </div>

      {/* DESKTOP-ONLY SIDEBAR (No changes here) */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background pt-16 md:block">
        <div className="h-full overflow-y-auto"><Sidebar /></div>
      </aside>

      {/* MAIN SCROLLABLE CONTENT AREA */}
      <main className={cn(
        "h-full w-full overflow-y-auto",
        "md:pl-64" // Desktop left padding
      )}>
        {/* 
          =========================================================================
          === THE CORE FIX: Correct Padding                                     ===
          === We apply top padding to the main scroll container itself to always ===
          === leave space for the header, fixing the overlap problem.          ===
          =========================================================================
        */}
        <div className={cn(
          "px-4 md:px-8 pb-24 md:pb-8", // Horizontal and bottom padding
          isFeedPage ? 'pt-4' : 'pt-20' // On Feed, small padding. On others, large padding to clear the fixed header.
        )}>
          {children}
        </div>
      </main>

      {/* MOBILE-ONLY UI (No changes here) */}
      {isSidebarOpen && (<div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />)}
      <aside className={cn("fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform md:hidden", isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="h-full overflow-y-auto"><Sidebar /></div>
      </aside>
      <BottomNavBar />
    </div>
  );
}

// The top-level wrapper component (No changes here)
export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (<SidebarProvider><MainLayout>{children}</MainLayout></SidebarProvider>);
}
