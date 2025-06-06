
// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Store, User as UserIconLucide, Bell } from 'lucide-react'; // Added Bell
import { cn } from '@/lib/utils';
import type { NavLink as NavLinkType } from '@/types'; // Renamed NavLink to NavLinkType
import { useEffect, useState } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

const MOCK_USER_ID_FALLBACK = '1'; // Should ideally not be needed if authUserId is always present

const getBottomNavLinks = (lang: string, notificationCount: number): NavLinkType[] => [
  { href: '/', label: lang === 'hi' ? 'फ़ीड' : 'Feed', icon: <Home className="h-5 w-5" /> },
  { href: '/discover', label: lang === 'hi' ? 'खोजें' : 'Discover', icon: <Search className="h-5 w-5" /> },
  { href: '/post/create', label: lang === 'hi' ? 'बनाएं' : 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  { 
    href: '/notifications', 
    label: lang === 'hi' ? 'सूचनाएं' : 'Alerts', 
    icon: <Bell className="h-5 w-5" />, 
    badgeCount: notificationCount 
  },
  { href: `/`, label: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: <UserIconLucide className="h-5 w-5" /> },
  // Mandi was removed in a previous step, so it's not included here.
  // If Mandi needs to be re-added, it would go here.
  // { href: '/mandi', label: lang === 'hi' ? 'मंडी' : 'Mandi', icon: <Store className="h-5 w-5" /> },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { authUserId, notificationCount } = useSidebarContext(); // authUserId is available if needed for other logic, but profile link is now static "/"
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [links, setLinks] = useState(() => getBottomNavLinks('en', notificationCount));

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    setLinks(getBottomNavLinks(currentLanguage, notificationCount));
  }, [currentLanguage, notificationCount]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedAppLanguage' && event.newValue) {
        setCurrentLanguage(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-card border-t border-border shadow-md flex items-center justify-around z-40">
      {links.map((link) => {
        // Updated isActive logic: If link.href is '/', it should only be active if pathname is strictly '/'.
        // Other links can be active if pathname starts with link.href (for nested routes).
        // The profile link specifically (now '/') should be active when pathname is '/'.
        let isActive = pathname === link.href;
        if (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1) {
          // For non-root links, allow prefix matching for active state (e.g. /discover active for /discover/something)
          isActive = true;
        }
        
        // Special handling for notifications page to clear badge when active
        const displayBadgeCount = (link.href === '/notifications' && isActive) ? 0 : link.badgeCount;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium h-full px-1 min-w-[60px] transition-colors relative',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              {link.icon}
              {displayBadgeCount !== undefined && displayBadgeCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {displayBadgeCount > 9 ? '9+' : displayBadgeCount}
                </span>
              )}
            </div>
            <span className="mt-0.5 truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
