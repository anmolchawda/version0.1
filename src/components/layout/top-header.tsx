// src/components/layout/top-header.tsx
'use client';

import React, { useEffect, useState } from 'react';
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

  // --- All your useEffect hooks for notifications remain the same ---
  useEffect(() => {
    if (!authUserId || !db) { setNotificationCount(0); return; }
    const q = query(collection(db, 'notifications', authUserId, 'items'), where('read', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => setNotificationCount(snapshot.size));
    return () => unsubscribe();
  }, [authUserId, setNotificationCount]);
  useEffect(() => {
    if (!authUserId || !db) { setUnreadMessageCount(0); return; }
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', authUserId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const convo = doc.data() as FirestoreConversation;
        const userReadTimestamp = convo.readStatus?.[authUserId];
        const lastMessageTimestamp = convo.lastMessageTimestamp;
        if (lastMessageTimestamp && convo.lastMessageSenderId !== authUserId) {
          if (!userReadTimestamp || lastMessageTimestamp.toMillis() > userReadTimestamp.toMillis()) count++;
        }
      });
      setUnreadMessageCount(count);
    });
    return () => unsubscribe();
  }, [authUserId, setUnreadMessageCount]);

  const displayNotificationCount = notificationCount > 0 && !pathname.startsWith('/notifications') ? notificationCount : 0;
  const displayMessageCount = unreadMessageCount > 0 && !pathname.startsWith('/messages') ? unreadMessageCount : 0;

  return (
    // This header is fixed to the top and has a z-index of 40.
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 h-auto bg-background border-b shadow-sm",
      "safe-area-top" // Adds top padding for status bar/notch
    )}>
      {/* 3-column layout to perfectly center the logo */}
      <div className="flex h-16 w-full items-center justify-between px-2 sm:px-4">
        {/* Left Column (fixed width) */}
        <div className="flex w-[60px] justify-start">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-10 w-10 md:hidden" aria-label="Toggle sidebar">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Center Column (grows to fill space) */}
        <div className="flex flex-1 justify-center">
          <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
        </div>

        {/* Right Column (fixed width) */}
        <div className="flex w-[120px] justify-end space-x-1 sm:space-x-2">
          <Link href="/discover" passHref><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Search"><Search className="h-5 w-5 text-primary" /></Button></Link>
          <Link href="/notifications" passHref><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Notifications"><Bell className="h-5 w-5 text-primary" />{displayNotificationCount > 0 && (<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">{displayNotificationCount > 9 ? '9+' : displayNotificationCount}</span>)}</Button></Link>
          <Link href="/messages" passHref><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Messages"><MessageSquare className="h-5 w-5 text-primary" />{displayMessageCount > 0 && (<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">{displayMessageCount > 9 ? '9+' : displayMessageCount}</span>)}</Button></Link>
        </div>
      </div>
    </header>
  );
};

export const TopHeader = React.memo(TopHeaderComponent);
