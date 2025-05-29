// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
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
  Cpu,
  Settings as SettingsIcon,
  ScrollText,
  CloudSun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MOCK_USER_ID = '1';

const NavLinkItem: React.FC<{
  href: string;
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  isSidebarOpen: boolean;
  itemClassName?: string;
}> = ({ href, label, icon, isActive, isSidebarOpen, itemClassName }) => {
  const { closeSidebar: contextCloseSidebar } = useSidebarContext();

  const handleClick = () => {
    if (contextCloseSidebar) {
      contextCloseSidebar();
    }
  };

  const linkElement = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        !isSidebarOpen && "justify-center", // Center icon when collapsed
        itemClassName
      )}
      onClick={handleClick}
    >
      {icon}
      {isSidebarOpen && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!isSidebarOpen) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          {label && ( // Ensure label exists before rendering TooltipContent
            <TooltipContent side="right" className="bg-background text-foreground border">
              <p>{label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkElement; // Render only the Link when sidebar is open
};


export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebarContext();
  const mockUser: User | undefined = getPlaceholderUser(MOCK_USER_ID);

  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }

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

  const secondaryNavLinks = useMemo((): NavLink[] => [
    { href: '/crop-science', label: currentLanguage === 'hi' ? 'फसल विज्ञान' : 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
    { href: '/yojna', label: currentLanguage === 'hi' ? 'योजना' : 'Yojna', icon: <ScrollText className="h-5 w-5" /> },
    { href: '/weather', label: currentLanguage === 'hi' ? 'मौसम' : 'Weather', icon: <CloudSun className="h-5 w-5" /> },
    { href: '/fungicides', label: currentLanguage === 'hi' ? 'कवकनाशी' : 'Fungicides', icon: <SprayCan className="h-5 w-5" /> },
    { href: '/insecticides', label: currentLanguage === 'hi' ? 'कीटनाशक' : 'Insecticides', icon: <Bug className="h-5 w-5" /> },
    { href: '/irac-code', label: currentLanguage === 'hi' ? 'IRAC कोड' : 'IRAC Code', icon: <Code2 className="h-5 w-5" /> },
    { href: '/frac-code', label: currentLanguage === 'hi' ? 'FRAC कोड' : 'FRAC Code', icon: <Code2 className="h-5 w-5" /> },
    { href: '/ai-features', label: currentLanguage === 'hi' ? 'AI' : 'AI', icon: <Cpu className="h-5 w-5" /> },
  ], [currentLanguage]);

  const settingsLabel = useMemo(() => (currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'), [currentLanguage]);

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'KrishiX User';
  
  const settingsLinkElement = (
      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full justify-start gap-3", // Base styles
          !isSidebarOpen && "justify-center p-2.5 h-auto" // Styles for collapsed state (icon only)
        )}
        onClick={closeSidebar}
      >
        <Link href="/settings" aria-label={settingsLabel}>
          <SettingsIcon className="h-5 w-5" />
          {isSidebarOpen && <span>{settingsLabel}</span>}
        </Link>
      </Button>
  );


  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col",
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 transition-transform duration-300 ease-in-out z-30 shadow-lg",
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {secondaryNavLinks.map((link) => (
           <NavLinkItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            isActive={pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/' && link.href.length > 1)}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </div>

      <div className="mt-auto p-2 space-y-2 border-t">
        {!isSidebarOpen ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{settingsLinkElement}</TooltipTrigger>
              <TooltipContent side="right" className="bg-background text-foreground border">
                <p>{settingsLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          settingsLinkElement
        )}

        <Separator />

        {isSidebarOpen ? (
           <Link
            href={`/profile/${MOCK_USER_ID}`}
            className={cn("flex items-center gap-3 group p-2 rounded-md hover:bg-muted")}
            onClick={closeSidebar}
          >
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={mockUser?.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
              <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
              <span className="text-xs text-muted-foreground truncate">@{mockUser?.username}</span>
            </div>
          </Link>
        ) : (
           <div className="flex justify-center p-2">
             <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href={`/profile/${MOCK_USER_ID}`} onClick={closeSidebar} aria-label={`${userNameDisplay} Profile`}>
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={mockUser?.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
                                <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                            </Avatar>
                         </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-background text-foreground border">
                        <p>{userNameDisplay}</p>
                        <p className="text-xs text-muted-foreground">@{mockUser?.username}</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
           </div>
        )}
      </div>
    </aside>
  );
}
