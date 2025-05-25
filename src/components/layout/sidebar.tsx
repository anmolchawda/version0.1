// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, type ReactNode } from 'react';
// AppLogo is now in AppHeader
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  FlaskConical,
  SprayCan,
  Bug,
  Code2,
  Brain,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MOCK_USER_ID = '1';

const getSecondaryNavLinks = (lang: string): NavLink[] => [
  { href: '/crop-science', label: lang === 'hi' ? 'फसल विज्ञान' : 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
  { href: '/fungicides', label: lang === 'hi' ? 'कवकनाशी' : 'Fungicides', icon: <SprayCan className="h-5 w-5" /> },
  { href: '/insecticides', label: lang === 'hi' ? 'कीटनाशक' : 'Insecticides', icon: <Bug className="h-5 w-5" /> },
  { href: '/irac-code', label: lang === 'hi' ? 'IRAC कोड' : 'IRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/frac-code', label: lang === 'hi' ? 'FRAC कोड' : 'FRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/ai-features', label: lang === 'hi' ? 'AI सुविधाएँ' : 'AI Features', icon: <Brain className="h-5 w-5" /> },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
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
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-card text-card-foreground border-r flex flex-col h-[calc(100vh-4rem)]", // Full height minus header
          "sticky transition-all duration-300 ease-in-out z-30",
          "top-16", // Positioned below the AppHeader (h-16 or 4rem)
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header section (logo and toggle) is now moved to AppHeader */}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {secondaryLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1);
            const linkContent = (
              <>
                {link.icon}
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </>
            );

            return (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isCollapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {linkContent}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right"><p>{link.label}</p></TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        <div className="mt-auto p-2 space-y-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start gap-3", isCollapsed ? "justify-center px-0" : "")}
                asChild
              >
                <Link href="/settings">
                  <SettingsIcon className="h-5 w-5" />
                  {!isCollapsed && <span>{settingsLabel}</span>}
                </Link>
              </Button>
            </TooltipTrigger>
             {isCollapsed && <TooltipContent side="right"><p>{settingsLabel}</p></TooltipContent>}
          </Tooltip>

          {!isCollapsed && <Separator />}

          {mockUser && (
             <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/profile/${mockUser.id}`}
                  className={cn(
                    "flex items-center gap-3 group p-2 rounded-md hover:bg-muted",
                     isCollapsed ? "justify-center" : ""
                  )}
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
                    <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
                      <span className="text-xs text-muted-foreground truncate">@{mockUser.username}</span>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right"><p>{userNameDisplay} (@{mockUser.username})</p></TooltipContent>}
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
