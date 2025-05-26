// src/components/layout/top-header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';

export function TopHeader() {
  const { toggleSidebar } = useSidebarContext();

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
        <AppLogo iconClassName="h-24 w-24" textClassName="hidden" />
      </div>

      {/* Right: Messages Icon */}
      <Link href="/messages" passHref>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="sr-only">Messages</span>
        </Button>
      </Link>
    </header>
  );
}
