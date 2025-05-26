
// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  FlaskConical, SprayCan, Bug, Code2, Brain, Settings as SettingsIcon, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';

const MOCK_USER_ID = '1';

const getSecondaryNavLinks = (lang: string): NavLink[] => [
  { href: '/crop-science', label: lang === 'hi' ? 'फसल विज्ञान' : 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
  { href: '/fungicides', label: lang === 'hi' ? 'कवकनाशी' : 'Fungicides', icon: <SprayCan className="h-5 w-5" /> },
  { href: '/insecticides', label: lang === 'hi' ? 'कीटनाशक' : 'Insecticides', icon: <Bug className="h-5 w-5" /> },
  { href: '/irac-code', label: lang === 'hi' ? 'IRAC कोड' : 'IRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/frac-code', label: lang === 'hi' ? 'FRAC कोड' : 'FRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/ai-features', label: lang === 'hi' ? 'AI सुविधाएँ' : 'AI Features', icon: <Brain className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebarContext();
  const mockUser: User | undefined = getPlaceholderUser(MOCK_USER_ID);

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [secondaryLinks, setSecondaryLinks] = useState(() => getSecondaryNavLinks('en'));
  const [settingsLabel, setSettingsLabel] = useState('Settings');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
      setSecondaryLinks(getSecondaryNavLinks(storedLanguage));
      setSettingsLabel(storedLanguage === 'hi' ? 'सेटिंग्स' : 'Settings');
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedAppLanguage' && event.newValue) {
        setCurrentLanguage(event.newValue);
        setSecondaryLinks(getSecondaryNavLinks(event.newValue));
        setSettingsLabel(event.newValue === 'hi' ? 'सेटिंग्स' : 'Settings');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col",
        "fixed top-16 left-0 bottom-0 transition-transform duration-300 ease-in-out z-40 shadow-lg", // top-16 to be below TopHeader
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64' // Width is fixed, transform controls visibility
      )}
    >
      {/* Sidebar Header - Close Button */}
      <div className="p-4 border-b flex items-center justify-end">
        {/* AppLogo is now in TopHeader */}
        <Button
          variant="ghost"
          size="icon"
          onClick={closeSidebar} // Use closeSidebar from context
          className="h-8 w-8"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Sidebar Content */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {secondaryLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1);
          return (
            <Link
              key={link.label} // Use label as key since it changes with language
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={closeSidebar} // Close sidebar on link click for mobile-like experience
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-2 space-y-2 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          asChild
        >
          <Link href="/settings" onClick={closeSidebar}>
            <SettingsIcon className="h-5 w-5" />
            <span>{settingsLabel}</span>
          </Link>
        </Button>

        <Separator />

        {mockUser && (
          <Link
            href={`/profile/${mockUser.id}`}
            className="flex items-center gap-3 group p-2 rounded-md hover:bg-muted"
            onClick={closeSidebar}
          >
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
              <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
              <span className="text-xs text-muted-foreground truncate">@{mockUser.username}</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
