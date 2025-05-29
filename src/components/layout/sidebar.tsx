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
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MOCK_USER_ID = '1';

interface NavLinkItemProps {
  href: string;
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  isSidebarOpen: boolean;
  itemClassName?: string;
  ariaLabel?: string;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ href, label, icon, isActive, isSidebarOpen, itemClassName, ariaLabel }) => {
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
        !isSidebarOpen && "justify-center",
        itemClassName
      )}
      onClick={handleClick}
      aria-label={!isSidebarOpen ? ariaLabel || label : undefined}
    >
      {React.cloneElement(icon, { className: cn(icon.props.className, 'h-5 w-5') })}
      {isSidebarOpen && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!isSidebarOpen) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          {label && (
            <TooltipContent side="right" className="bg-background text-foreground border">
              <p>{label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }
  return linkElement;
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
    { href: '/crop-science', label: currentLanguage === 'hi' ? 'फसल विज्ञान' : 'Crop Science', icon: <FlaskConical /> },
    { href: '/weather', label: currentLanguage === 'hi' ? 'मौसम' : 'Weather', icon: <CloudSun /> },
    { href: '/ai-features', label: currentLanguage === 'hi' ? 'AI' : 'AI', icon: <Cpu /> },
    { href: '/yojna', label: currentLanguage === 'hi' ? 'योजना' : 'Yojna', icon: <ScrollText /> },
    { href: '/events', label: currentLanguage === 'hi' ? 'कार्यक्रम' : 'Events', icon: <CalendarDays /> },
    { href: '/fungicides', label: currentLanguage === 'hi' ? 'कवकनाशी' : 'Fungicides', icon: <SprayCan /> },
    { href: '/insecticides', label: currentLanguage === 'hi' ? 'कीटनाशक' : 'Insecticides', icon: <Bug /> },
    { href: '/irac-code', label: currentLanguage === 'hi' ? 'IRAC कोड' : 'IRAC Code', icon: <Code2 /> },
    { href: '/frac-code', label: currentLanguage === 'hi' ? 'FRAC कोड' : 'FRAC Code', icon: <Code2 /> },
  ], [currentLanguage]);

  const settingsLabel = useMemo(() => (currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'), [currentLanguage]);

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'KrishiX User';
  
  const settingsLinkElement = (
      <Button
        asChild
        variant={isSidebarOpen ? "outline" : "ghost"}
        className={cn(
          "w-full justify-start gap-3",
           !isSidebarOpen && "justify-center p-2 h-auto"
        )}
        onClick={closeSidebar}
        aria-label={!isSidebarOpen ? settingsLabel : undefined}
      >
        <Link href="/settings">
          <SettingsIcon className="h-5 w-5" />
          {isSidebarOpen && <span>{settingsLabel}</span>}
        </Link>
      </Button>
  );

  const userProfileElement = (
    <Link
      href={`/profile/${MOCK_USER_ID}`}
      className={cn(
        "flex items-center gap-3 group p-2 rounded-md hover:bg-muted",
        !isSidebarOpen && "justify-center"
      )}
      onClick={closeSidebar}
      aria-label={!isSidebarOpen ? `${userNameDisplay} Profile` : undefined}
    >
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={mockUser?.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
        <AvatarFallback>{userAvatarFallback}</AvatarFallback>
      </Avatar>
      {isSidebarOpen && (
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
          <span className="text-xs text-muted-foreground truncate">@{mockUser?.username}</span>
        </div>
      )}
    </Link>
  );

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col",
        "fixed left-0 top-16 h-[calc(100vh-8rem)] shadow-lg", // 8rem = 4rem top + 4rem bottom
        "transition-transform duration-300 ease-in-out z-30",
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
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
            ariaLabel={link.label}
          />
        ))}
      </div>

      <div className="mt-auto p-2 space-y-2 border-t">
        {!isSidebarOpen ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{settingsLinkElement}</TooltipTrigger>
              {settingsLabel && (
                 <TooltipContent side="right" className="bg-background text-foreground border">
                    <p>{settingsLabel}</p>
                 </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          settingsLinkElement
        )}

        <Separator />

        {!isSidebarOpen ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{userProfileElement}</TooltipTrigger>
               {userNameDisplay && (
                  <TooltipContent side="right" className="bg-background text-foreground border">
                    <p>{userNameDisplay}</p>
                    {mockUser?.username && <p className="text-xs text-muted-foreground">@{mockUser?.username}</p>}
                  </TooltipContent>
               )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          userProfileElement
        )}
      </div>
    </aside>
  );
}
