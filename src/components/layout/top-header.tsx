// src/components/layout/top-header.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Added React
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, doc, onSnapshot, setDoc, getDoc } from '@/lib/firebase'; // db can be null

const TopHeaderComponent = () => { // Changed to named component
  const { toggleSidebar, setNotificationCount, authUserId } = useSidebarContext();
  const pathname = usePathname();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [localNotificationCount, setLocalNotificationCount] = useState(0);

  useEffect(() => {
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      setUnreadMessageCount(0);
    }
    // Notification count reset is handled by the notifications page itself now
    // or via the listener below when on the page.
  }, [pathname]);

  useEffect(() => {
    if (authUserId && db) { // Check if db is available
      const notificationDocRef = doc(db, 'notificationsMeta', authUserId);
      
      const unsubscribe = onSnapshot(notificationDocRef, async (docSnap) => {
        let count = 0;
        if (docSnap.exists()) {
          count = docSnap.data()?.unreadCount || 0;
        }
        
        setLocalNotificationCount(count);
        // Update context only if not on notifications page, as page itself clears it
        if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
          setNotificationCount(count);
        }
      }, (error) => {
        console.error("[TopHeader] Error fetching notification count for user", authUserId, ":", error);
        setLocalNotificationCount(0);
        if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
          setNotificationCount(0);
        }
      });
      
      // Initial check and reset if on notifications page & count > 0
      // This ensures the badge is cleared if user directly lands on /notifications
      const checkAndClearNotifications = async () => {
        if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
          const currentDoc = await getDoc(notificationDocRef);
          if(currentDoc.exists() && currentDoc.data()?.unreadCount !== 0) {
              setDoc(notificationDocRef, { unreadCount: 0 }, { merge: true })
              .then(() => setNotificationCount(0)) // Also update context immediately
              .catch(error => console.error("[TopHeader] Error clearing notification count in Firestore for user", authUserId, ":", error));
          } else {
            setNotificationCount(0); // Ensure context is 0 if Firestore is already 0
          }
        }
      };

      checkAndClearNotifications();

      return () => unsubscribe();
    } else {
      setLocalNotificationCount(0);
      setNotificationCount(0); // Clear context if no user or mock mode
    }
  }, [authUserId, db, setNotificationCount, pathname]);

  // Determine display count for badge, ensuring it's 0 if on the notifications page
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

export const TopHeader = React.memo(TopHeaderComponent); // Memoize
