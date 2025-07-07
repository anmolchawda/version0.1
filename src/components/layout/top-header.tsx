
// src/components/layout/top-header.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Added React
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, where, onSnapshot } from '@/lib/firebase'; // db can be null

const TopHeaderComponent = () => { // Changed to named component
  const { toggleSidebar, notificationCount, setNotificationCount, authUserId } = useSidebarContext();
  const pathname = usePathname();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    // This effect is for demonstration and would be replaced by a real-time listener
    if (pathname.startsWith('/messages')) {
      setUnreadMessageCount(0);
    }
  }, [pathname]);

  // Listener for unread notifications count
  useEffect(() => {
    if (!authUserId || !db) {
      setNotificationCount(0);
      return;
    }

    const notificationsRef = collection(db, 'notifications', authUserId, 'items');
    const q = query(notificationsRef, where('read', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreadCount = snapshot.size;
      setNotificationCount(unreadCount);
    }, (error) => {
      console.error("[TopHeader] Error fetching notification count:", error);
      setNotificationCount(0); // Reset on error
    });

    return () => unsubscribe();
  }, [authUserId, db, setNotificationCount]);


  // Determine display count for badge.
  const displayNotificationCount = notificationCount > 0 && !pathname.startsWith('/notifications') ? notificationCount : 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-2 sm:px-4 z-50 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-10 w-10"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <Link href="/discover" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Search">
            <Search className="h-5 w-5 text-primary" />
          </Button>
        </Link>
        <Link href="/notifications" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-primary" />
            {displayNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                {displayNotificationCount > 9 ? '9+' : displayNotificationCount}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/messages" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Messages">
            <MessageSquare className="h-5 w-5 text-primary" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}

export const TopHeader = React.memo(TopHeaderComponent); // Memoize
