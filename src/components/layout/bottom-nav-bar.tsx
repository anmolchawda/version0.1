
// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Home, Cpu, PlusSquare, Store, User as UserIconLucide } from 'lucide-react'; // Replaced Search with Cpu
import { cn } from '@/lib/utils';
import type { NavLink as NavLinkType } from '@/types';
// import { useSidebarContext } from '@/contexts/SidebarContext'; // Not directly used for link rendering currently

const MOCK_USER_ID_FALLBACK = '1'; 

const getBottomNavLinks = (lang: string): NavLinkType[] => [
  { href: '/feed', label: lang === 'hi' ? 'फ़ीड' : 'Feed', icon: <Home className="h-5 w-5" /> },
  { href: '/ai-features', label: 'AI', icon: <Cpu className="h-5 w-5" /> }, // Changed from Discover to AI
  { href: '/post/create', label: lang === 'hi' ? 'बनाएं' : 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  { href: '/mandi', label: lang === 'hi' ? 'मंडी' : 'Mandi', icon: <Store className="h-5 w-5" /> },
  { href: `/`, label: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: <UserIconLucide className="h-5 w-5" /> },
];

interface BottomNavLinkItemProps {
  link: NavLinkType;
  isActive: boolean;
}

const BottomNavLinkItemComponent: React.FC<BottomNavLinkItemProps> = ({ link, isActive }) => {
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
      </div>
      <span className="mt-0.5 truncate">{link.label}</span>
    </Link>
  );
};

const BottomNavLinkItem = React.memo(BottomNavLinkItemComponent);


export function BottomNavBar() {
  const pathname = usePathname();
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
        // Special handling for profile page if its href is just "/"
        if (link.href === '/' && pathname === '/') {
            isActive = true;
        } else if (link.href !== '/' && link.href !== '/feed' && link.href.length > 1 && pathname.startsWith(link.href)) {
          isActive = true;
        }
        
        // Specific check for /ai-features
        if (link.href === '/ai-features' && pathname === '/ai-features') {
            isActive = true;
        }


        return (
          <BottomNavLinkItem
            key={link.href}
            link={link}
            isActive={isActive}
          />
        );
      })}
    </nav>
  );
}
