
// src/components/layout/top-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot, setDoc } from '@/lib/firebase'; // Added setDoc

export function TopHeader() {
  const { toggleSidebar, setNotificationCount } = useSidebarContext();
  const pathname = usePathname();
  const [unreadMessageCount, setUnreadMessageCount] = useState(3); // Mock message count
  const [localNotificationCount, setLocalNotificationCount] = useState(0);

  const currentAuthUser = auth.currentUser;

  useEffect(() => {
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      setUnreadMessageCount(0);
    }
    if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
      setNotificationCount(0);
      if (currentAuthUser) {
        // Mark notifications as read in Firestore when visiting the page
        const userNotificationsMetaRef = doc(db, 'notificationsMeta', currentAuthUser.uid);
        setDoc(userNotificationsMetaRef, { unreadCount: 0 }, { merge: true })
          .catch(error => console.error("Error clearing notification count in Firestore:", error));
      }
    }
  }, [pathname, setNotificationCount, currentAuthUser]);

  useEffect(() => {
    if (currentAuthUser) {
      const notificationDocRef = doc(db, 'notificationsMeta', currentAuthUser.uid); // Use currentAuthUser.uid
      const unsubscribe = onSnapshot(notificationDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const count = docSnap.data()?.unreadCount || 0;
          setLocalNotificationCount(count);
          // Only update context if not on the notifications page itself to avoid loop/overwrite
          if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
            setNotificationCount(count);
          }
        } else {
          console.log(`Notification summary document for user ${currentAuthUser.uid} does not exist. Assuming 0 unread.`);
          setLocalNotificationCount(0);
          setNotificationCount(0); // Ensure context is also 0 if doc doesn't exist
        }
      }, (error) => {
        console.error("Error fetching notification count:", error);
        setLocalNotificationCount(0);
        setNotificationCount(0);
      });

      return () => unsubscribe();
    } else {
      setLocalNotificationCount(0);
      setNotificationCount(0);
    }
  }, [currentAuthUser, setNotificationCount, pathname]);

  const displayNotificationCount = (pathname === '/notifications' || pathname.startsWith('/notifications/'))
                                     ? 0
                                     : localNotificationCount;


  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-2 sm:px-4 z-50 shadow-sm">
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
        <AppLogo iconClassName="h-12 w-12" textClassName="hidden" />
      </div>

      {/* Right: Search, Notifications, and Messages Icons */}
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
