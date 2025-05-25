// src/components/layout/app-header.tsx
'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/core/app-logo';
import { Button } from '@/components/ui/button';
import { Menu, ChevronLeft, MessageSquare } from 'lucide-react';

interface AppHeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export function AppHeader({ isSidebarCollapsed, toggleSidebar }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9"
          aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        <AppLogo iconClassName="h-7 w-7" textClassName={isSidebarCollapsed ? "hidden sm:inline" : "text-lg"} />
      </div>
      <div className="flex items-center gap-3">
        {/* Future: Add search or other icons here if needed */}
        <Link href="/messages" passHref>
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Messages">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>
        {/* User Avatar/Dropdown could be re-added here if not in sidebar bottom */}
      </div>
    </header>
  );
}
