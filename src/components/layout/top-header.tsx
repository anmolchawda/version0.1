// src/components/layout/top-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';

export function TopHeader() {
  const { toggleSidebar } = useSidebarContext();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(3); // Mock unread count

  useEffect(() => {
    // Simulate clearing unread messages when user navigates to messages section
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      setUnreadCount(0);
    }
    // In a real app, you might want to re-fetch or subscribe to unread counts
    // if the user navigates away and back, or based on real-time events.
    // For this simulation, we'll keep it simple. If you want it to reappear
    // for demo purposes when navigating away, you could add more complex logic here or
    // re-initialize it based on some other trigger. For now, it just clears.
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-4 z-50 shadow-sm">
      {/* Left: Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-10 w-10"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Center: App Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
      </div>

      {/* Right: Messages Icon */}
      <Link href="/messages" passHref>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative">
          <MessageSquare className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </Link>
    </header>
  );
}
