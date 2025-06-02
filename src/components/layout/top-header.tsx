
// src/components/layout/top-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/core/app-logo';
import { Menu, MessageSquare, Search, Bell } from 'lucide-react'; // Added Search, Bell
import { useSidebarContext } from '@/contexts/SidebarContext';
import { auth, db, doc, onSnapshot } from '@/lib/firebase'; // Firebase imports

export function TopHeader() {
  const { toggleSidebar, setNotificationCount } = useSidebarContext();
  const pathname = usePathname();
  const [unreadMessageCount, setUnreadMessageCount] = useState(3); // Mock message count
  const [localNotificationCount, setLocalNotificationCount] = useState(0);

  const currentAuthUser = auth.currentUser;

  useEffect(() => {
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      setUnreadMessageCount(0); // Clear message count when on messages page
    }
    if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
      // Locally reset notification count in context when notifications page is visited
      setNotificationCount(0); 
      // In a real app, you'd also update Firestore to mark notifications as read here.
      // For example: updateDoc(doc(db, 'notificationsMeta', 'urX6tmeNn5r9fMDQ40ln'), { unreadCount: 0 });
    }
  }, [pathname, setNotificationCount]);

  useEffect(() => {
    if (currentAuthUser) {
      const notificationDocRef = doc(db, 'notificationsMeta', 'urX6tmeNn5r9fMDQ40ln');
      const unsubscribe = onSnapshot(notificationDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const count = docSnap.data()?.unreadCount || 0;
          setLocalNotificationCount(count);
          if (!(pathname === '/notifications' || pathname.startsWith('/notifications/'))) {
            setNotificationCount(count); // Update context if not on notifications page
          }
        } else {
          console.log("Notification summary document does not exist.");
          setLocalNotificationCount(0);
          setNotificationCount(0);
        }
      }, (error) => {
        console.error("Error fetching notification count:", error);
        setLocalNotificationCount(0);
        setNotificationCount(0);
      });

      return () => unsubscribe();
    } else {
      // Clear counts if user logs out
      setLocalNotificationCount(0);
      setNotificationCount(0);
    }
  }, [currentAuthUser, setNotificationCount, pathname]);

  // Use notificationCount from context for display, but let localNotificationCount drive the effect
  // This avoids re-triggering context update when on notifications page
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
                {displayNotificationCount}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/messages" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" aria-label="Messages">
            <MessageSquare className="h-5 w-5 text-primary" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                {unreadMessageCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
