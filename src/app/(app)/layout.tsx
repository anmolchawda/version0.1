// src/app/(main)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// This is the inner component that can now access the sidebar context
function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();

  // --- This is a simplified and robust authentication flow ---
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
    if (authStatus === 'unauthenticated' && !isAuthPage) {
      router.replace('/login');
    }
  }, [authStatus, pathname, router]);
  // --- End of Authentication Flow ---

  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup';
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* 1. FIXED TOP HEADER (Always Visible) */}
      <TopHeader />

      {/* 2. DESKTOP-ONLY SIDEBAR (Permanent & Scrollable) */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background pt-16 md:block">
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* 3. MAIN SCROLLABLE CONTENT AREA */}
      <main className={cn(
        "h-full w-full overflow-y-auto",
        "md:pl-64" // On desktop, add left padding to not overlap with the permanent sidebar
      )}>
        {/* Padding top/bottom keeps content from being hidden by fixed bars */}
        <div className="pt-20 pb-24 px-4 md:pb-8 md:px-8">
          {children}
        </div>
      </main>

      {/* 4. MOBILE-ONLY DRAWER & BACKDROP */}
      {/* Backdrop */}
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />
      )}

      {/* Drawer */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* 5. MOBILE-ONLY BOTTOM NAV */}
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
