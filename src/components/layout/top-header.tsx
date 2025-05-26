
// src/components/layout/top-header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';

export function TopHeader() {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-4 z-20 shadow-sm">
      {/* Left Spacer (can be used for logo if design changes) */}
      <div className="w-10 h-10"> {/* Balances the right messages icon */}
         {/* Intentionally empty to help center the Menu button, or place a small logo here if needed */}
      </div>

      {/* Centered Sidebar Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Right Messages Icon */}
      <div className="flex items-center justify-end">
        <Link href="/messages" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <MessageSquare className="h-5 w-5 text-primary" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
