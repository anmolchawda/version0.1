// src/components/layout/top-header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, where, onSnapshot } from '@/lib/firebase';
import type { FirestoreConversation } from '@/types';
import { cn } from '@/lib/utils';

const TopHeaderComponent = () => {
  const { toggleSidebar, notificationCount, setNotificationCount, authUserId, unreadMessageCount, setUnreadMessageCount } = useSidebarContext();
  const pathname = usePathname();

  // ... (all your useEffect hooks remain unchanged) ...
  // Listener for unread notifications count
  useEffect(() => {
    if (!authUserId || !db) {
      setNotificationCount(0);
      return;
    }
    const notificationsRef = collection(db, 'notifications', authUserId, 'items');
    const q = query(notificationsRef, where('read', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size);
    }, (error) => {
      console.error("[TopHeader] Error fetching notification count:", error);
      setNotificationCount(0);
    });
    return () => unsubscribe();
  }, [authUserId, setNotificationCount]);

  // Listener for unread messages count
  useEffect(() => {
    if (!authUserId || !db) {
      setUnreadMessageCount(0);
      return;
    }
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', authUserId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const convo = doc.data() as FirestoreConversation;
        const userReadTimestamp = convo.readStatus?.[authUserId];
        const lastMessageTimestamp = convo.lastMessageTimestamp;
        if (lastMessageTimestamp && convo.lastMessageSenderId !== authUserId) {
          if (!userReadTimestamp || lastMessageTimestamp.toMillis() > userReadTimestamp.toMillis()) {
            count++;
          }
        }
      });
      setUnreadMessageCount(count);
    }, (error) => {
      console.error("[TopHeader] Error fetching message count:", error);
      setUnreadMessageCount(0);
    });
    return () => unsubscribe();
  }, [authUserId, setUnreadMessageCount]);

  const displayNotificationCount = notificationCount > 0 && !pathname.startsWith('/notifications') ? notificationCount : 0;
  const displayMessageCount = unreadMessageCount > 0 && !pathname.startsWith('/messages') ? unreadMessageCount : 0;

  return (
    <header className={cn(
      "safe-area-top",
      "h-auto bg-background border-b z-40 shadow-sm"
    )}>
      {/* 
        ======================================================================
        === THE FIX FOR THE LOGO IS HERE                                   ===
        ======================================================================
        We use a 3-column layout.
        - Left and Right columns have a fixed size.
        - The Center column (with the logo) grows to fill the remaining space.
        - The logo itself is then centered within that flexible middle column.
        This automatically avoids the camera notch.
      */}
      <div className="flex h-16 w-full items-center justify-between px-2 sm:px-4">
        {/* Left Column (for hamburger menu) */}
        <div className="flex w-[60px] justify-start">
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

        {/* Center Column (for the logo) - This grows and shrinks */}
        <div className="flex flex-1 justify-center">
          <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
        </div>

        {/* Right Column (for action icons) */}
        <div className="flex w-[120px] justify-end space-x-1 sm:space-x-2">
          <Link href="/discover" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Search">
              <Search className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <Link href="/notifications" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Notifications">
              <Bell className="h-5 w-5 text-primary" />
              {displayNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {displayNotificationCount > 9 ? '9+' : displayNotificationCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/messages" passHref>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Messages">
              <MessageSquare className="h-5 w-5 text-primary" />
              {displayMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {displayMessageCount > 9 ? '9+' : displayMessageCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export const TopHeader = React.memo(TopHeaderComponent);
