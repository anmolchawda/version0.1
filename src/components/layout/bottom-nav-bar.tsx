
// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Store, User as UserIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/types';
import { useEffect, useState } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext'; // Import context

const MOCK_USER_ID_FALLBACK = '1'; // Used for the Profile link if authUserId is null

const getBottomNavLinks = (lang: string, userId: string | null): NavLink[] => [
  { href: '/', label: lang === 'hi' ? 'फ़ीड' : 'Feed', icon: <Home className="h-5 w-5" /> },
  { href: '/discover', label: lang === 'hi' ? 'खोजें' : 'Discover', icon: <Search className="h-5 w-5" /> },
  { href: '/post/create', label: lang === 'hi' ? 'बनाएं' : 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  { href: '/mandi', label: lang === 'hi' ? 'मंडी' : 'Mandi', icon: <Store className="h-5 w-5" /> },
  { href: `/profile/${userId || MOCK_USER_ID_FALLBACK}`, label: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: <UserIconLucide className="h-5 w-5" /> },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { authUserId } = useSidebarContext(); // Get authUserId from context
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [links, setLinks] = useState(() => getBottomNavLinks('en', authUserId));

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    // Update links whenever authUserId or currentLanguage changes
    setLinks(getBottomNavLinks(currentLanguage, authUserId));
  }, [authUserId, currentLanguage]);

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
        // For profile link, check based on the dynamic part of the path
        const isActive = link.href.startsWith('/profile/') 
          ? pathname.startsWith('/profile/') 
          : (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1));

        return (
          <Link
            key={link.href} // Use href as key since label can change but path structure for profile is consistent
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium h-full px-2 min-w-[60px] transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {link.icon}
            <span className="mt-0.5 truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
