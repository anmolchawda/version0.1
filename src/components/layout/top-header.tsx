// src/components/layout/top-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, doc, onSnapshot, setDoc, getDoc } from '@/lib/firebase'; // db can be null

export function TopHeader() {
  const { toggleSidebar, setNotificationCount, authUserId } = useSidebarContext();
  const pathname = usePathname();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0); // Changed initial mock message count to 0
  const [localNotificationCount, setLocalNotificationCount] = useState(0);

  useEffect(() => {
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      setUnreadMessageCount(0);
    }
    if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
      setNotificationCount(0); 
    }
  }, [pathname, setNotificationCount]);

  useEffect(() => {
    if (authUserId && db) { // Check if db is available
      console.log("[TopHeader] AuthUserId and db available, setting up notification listener for user:", authUserId);
      const notificationDocRef = doc(db, 'notificationsMeta', authUserId);
      
      const unsubscribe = onSnapshot(notificationDocRef, async (docSnap) => {
        let count = 0;
        if (docSnap.exists()) {
          count = docSnap.data()?.unreadCount || 0;
          console.log("[TopHeader] Notification count from Firestore:", count, "for user:", authUserId);
        } else {
          console.log(`[TopHeader] Notification summary document for user ${authUserId} does not exist. Assuming 0 unread.`);
        }
        
        setLocalNotificationCount(count);
        if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
          setNotificationCount(count);
        }

        // If on notifications page and count became 0, ensure it's reflected in Firestore
        if ((pathname === '/notifications' || pathname.startsWith('/notifications/')) && count > 0) {
           // This scenario should ideally be handled by NotificationsPage marking as read
           // For safety, if we are on the page and detect a server-side count > 0, reset it.
           // However, this might conflict with NotificationsPage's own logic.
           // The primary "mark as read" logic should be in NotificationsPage.
        } else if ((pathname === '/notifications' || pathname.startsWith('/notifications/')) && count === 0) {
           // Already 0, context is fine.
        }


      }, (error) => {
        console.error("[TopHeader] Error fetching notification count for user", authUserId, ":", error);
        setLocalNotificationCount(0);
        if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
          setNotificationCount(0);
        }
      });
      
      // Initial check and reset if on notifications page
      if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
        console.log("[TopHeader] On notifications page, attempting to ensure unreadCount is 0 in Firestore for user:", authUserId);
        const currentDoc = await getDoc(notificationDocRef);
        if(currentDoc.exists() && currentDoc.data()?.unreadCount !== 0) {
            setDoc(notificationDocRef, { unreadCount: 0 }, { merge: true })
            .catch(error => console.error("[TopHeader] Error clearing notification count in Firestore for user", authUserId, ":", error));
        }
      }


      return () => {
        console.log("[TopHeader] Unsubscribing from notification listener for user:", authUserId);
        unsubscribe();
      };
    } else {
      if (!db) {
        console.log("[TopHeader] db is null (likely mock mode). Skipping Firestore notification listener.");
      } else if (!authUserId) {
        console.log("[TopHeader] No AuthUserId available. Clearing notification counts locally.");
      }
      setLocalNotificationCount(0);
      setNotificationCount(0);
    }
  }, [authUserId, db, setNotificationCount, pathname]);

  const displayNotificationCount = (pathname === '/notifications' || pathname.startsWith('/notifications/'))
                                     ? 0
                                     : localNotificationCount;


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
