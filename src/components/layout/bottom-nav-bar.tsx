
// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Store, User as UserIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink as NavLinkType } from '@/types';
import { useEffect, useState } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

const MOCK_USER_ID_FALLBACK = '1';

const getBottomNavLinks = (lang: string): NavLinkType[] => [
  { href: '/feed', label: lang === 'hi' ? 'फ़ीड' : 'Feed', icon: <Home className="h-5 w-5" /> },
  { href: '/discover', label: lang === 'hi' ? 'खोजें' : 'Discover', icon: <Search className="h-5 w-5" /> },
  { href: '/post/create', label: lang === 'hi' ? 'बनाएं' : 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  { href: '/mandi', label: lang === 'hi' ? 'मंडी' : 'Mandi', icon: <Store className="h-5 w-5" /> },
  // { 
  //   href: '/notifications', 
  //   label: lang === 'hi' ? 'सूचनाएं' : 'Alerts', 
  //   icon: <Bell className="h-5 w-5" />, 
  //   badgeCount: notificationCount // This was the line to remove/comment out
  // },
  { href: `/`, label: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: <UserIconLucide className="h-5 w-5" /> },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { authUserId, notificationCount } = useSidebarContext(); // notificationCount is no longer directly used here for links
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [links, setLinks] = useState(() => getBottomNavLinks('en'));

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    setLinks(getBottomNavLinks(currentLanguage));
  }, [currentLanguage]);

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
        let isActive = pathname === link.href;
        if (link.href !== '/' && link.href !== '/feed' && link.href.length > 1 && pathname.startsWith(link.href)) {
          isActive = true;
        }
        
        // Badge count logic is removed as the notification link itself is removed
        // const displayBadgeCount = (link.href === '/notifications' && isActive) ? 0 : link.badgeCount;

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
              {/* Badge rendering logic removed as notification link is removed */}
            </div>
            <span className="mt-0.5 truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
