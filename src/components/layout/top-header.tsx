// src/components/layout/top-header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, Search, Bell, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure this import is here

export const TopHeader = () => {
  const { toggleSidebar } = useSidebarContext();

  return (
    // =========================================================================
    // === THE FIX IS HERE: `h-auto` and `safe-area-top` class              ===
    // =========================================================================
    <header className={cn(
      "h-auto w-full border-b bg-background",
      "safe-area-top" // This utility class adds top padding ONLY where needed (for the status bar/notch).
    )}>
      {/* 
        This inner div has the fixed height for the content, ensuring alignment.
        The parent <header> handles the dynamic padding for the status bar.
      */}
      <div className="flex h-16 w-full items-center px-2">
        {/* Left section (for the menu button) */}
        <div className="w-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Center section (for the logo) */}
        <div className="flex-1 flex justify-center">
          <Link href="/feed" aria-label="Go to Feed">
            <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
          </Link>
        </div>

        {/* Right section (for the action icons) */}
        <div className="w-auto flex justify-end items-center space-x-1">
          <Link href="/discover" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Search">
              <Search className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <Link href="/notifications" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Notifications">
              <Bell className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <Link href="/messages" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Messages">
              <MessageSquare className="h-5 w-5 text-primary" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
