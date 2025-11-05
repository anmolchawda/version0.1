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
  { href: '/feed', label: t('feed'), icon: <Home className="h-5 w-5" /> },
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


function BottomNavBarComponent() {
  const pathname = usePathname();
  const { t, currentLanguage, isLoadingTranslations } = useTranslations(); // Use the hook
  const [links, setLinks] = useState(() => getBottomNavLinks(t));

  useEffect(() => {
    if (!isLoadingTranslations) { // Ensure translations are loaded before setting links
      setLinks(getBottomNavLinks(t));
    }
  }, [currentLanguage, t, isLoadingTranslations]);


  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-card border-t border-border shadow-md flex items-center justify-around z-40 pb-4">
      {links.map((link) => {
        const isActive = link.href === '/feed'
          ? pathname === '/feed' || pathname === '/'
          : pathname.startsWith(link.href);

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

export const BottomNavBar = React.memo(BottomNavBarComponent);
