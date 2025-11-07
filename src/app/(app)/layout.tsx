
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

  return (
    <div className="h-screen w-screen bg-background md:flex">
      <aside className="hidden h-full w-64 flex-shrink-0 border-r bg-background md:block">
        <Sidebar />
      </aside>

      <div className="relative flex h-full flex-1 flex-col overflow-y-auto">
        {/* Main Content ALWAYS has padding to avoid the bars */}
        <main className="h-full w-full overflow-y-auto pt-16 pb-16">
          {children}
        </main>

        {/* TOP HEADER is a fixed overlay */}
        <div className="absolute top-0 left-0 z-20 w-full">
          <TopHeader />
        </div>

        {/* MOBILE-ONLY BOTTOM NAV is a fixed overlay */}
        <div className="absolute bottom-0 left-0 z-20 w-full md:hidden">
          <BottomNavBar />
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
    </div>
  );
}

export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}
