// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Home, Cpu, PlusSquare, Store, User as UserIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink as NavLinkType } from '@/types';
import { useTranslations } from '@/hooks/useTranslations'; // Import the hook

const MOCK_USER_ID_FALLBACK = '1'; 

const getBottomNavLinks = (t: (key: any) => string): NavLinkType[] => [ // Pass t function
  { href: '/', label: t('feed'), icon: <Home className="h-5 w-5" /> }, // Changed href from /feed to /
  { href: '/ai-features', label: t('aiFeatures'), icon: <Cpu className="h-5 w-5" /> },
  { href: '/post/create', label: t('create'), icon: <PlusSquare className="h-5 w-5" /> },
  { href: '/mandi', label: t('mandi'), icon: <Store className="h-5 w-5" /> },
  { href: `/my-profile`, label: t('profile'), icon: <UserIconLucide className="h-5 w-5" /> }, // Changed href to /my-profile
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
  const { t, currentLanguage, isLoadingTranslations } = useTranslations(); // Use the hook
  const [links, setLinks] = useState(() => getBottomNavLinks(t));

  useEffect(() => {
    if (!isLoadingTranslations) { // Ensure translations are loaded before setting links
      setLinks(getBottomNavLinks(t));
    }
  }, [currentLanguage, t, isLoadingTranslations]);


  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-card border-t border-border shadow-md flex items-center justify-around z-40">
      {links.map((link) => {
        let isActive = pathname === link.href;
        // Special handling for profile page if its href is just "/"
        // Removed the original special handling for profile page as its href is now specific
        // and handling for feed page as its href is now "/"
        if (link.href === '/' && pathname === '/') { // For Feed page at root
            isActive = true;
        } else if (link.href !== '/' && link.href.length > 1 && pathname.startsWith(link.href)) {
          // For other pages like /ai-features, /mandi, /my-profile, /post/create
          isActive = true;
        }
        
        // Specific check for /ai-features (already covered by above, but kept for clarity if needed)
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
