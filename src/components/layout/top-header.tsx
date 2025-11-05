// src/components/layout/top-header.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Added React
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, where, onSnapshot, Timestamp } from '@/lib/firebase';
import type { FirestoreConversation } from '@/types';

const TopHeaderComponent = () => { // Changed to named component
  const { toggleSidebar, notificationCount, setNotificationCount, authUserId, unreadMessageCount, setUnreadMessageCount } = useSidebarContext();
  const pathname = usePathname();

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
        
        // Count as unread if there's a last message, it wasn't sent by the current user,
        // and it's newer than the user's last read time (or if they've never read it).
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
  }, [authUserId, db, setUnreadMessageCount]);


  // Determine display count for badges.
  const displayNotificationCount = notificationCount > 0 && !pathname.startsWith('/notifications') ? notificationCount : 0;
  const displayMessageCount = unreadMessageCount > 0 && !pathname.startsWith('/messages') ? unreadMessageCount : 0;

  return (
    // =================================================================
    // === THE FIX IS HERE: "safe-area-top" has been added to this line ===
    // =================================================================
    <header className="safe-area-top fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-2 sm:px-4 z-30 shadow-sm">
      <div className="flex items-center">
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

      <div className="flex-1 flex justify-center items-center">
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
            {displayMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                {displayMessageCount > 9 ? '9+' : displayMessageCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}

export const TopHeader = React.memo(TopHeaderComponent); // Memoize
