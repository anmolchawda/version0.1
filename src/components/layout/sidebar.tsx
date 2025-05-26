// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  Home,
  Search,
  PlusSquare,
  Store,
  User as UserProfileIcon,
  FlaskConical,
  SprayCan,
  Bug,
  Code2,
  Brain,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MOCK_USER_ID = '1';

// Helper function to generate NavLink items with tooltips
const NavLinkItem: React.FC<{ link: NavLink; isActive: boolean; isSidebarOpen: boolean; onClick?: () => void }> = ({ link, isActive, isSidebarOpen, onClick }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            !isSidebarOpen && "justify-center" // Center icon when collapsed
          )}
          onClick={onClick}
        >
          {link.icon}
          {isSidebarOpen && <span>{link.label}</span>}
        </Link>
      </TooltipTrigger>
      {!isSidebarOpen && link.label && (
        <TooltipContent side="right" className="bg-background text-foreground border">
          <p>{link.label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);


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


  const mainNavLinks = useMemo((): NavLink[] => [
    // { href: '/', label: currentLanguage === 'hi' ? 'फ़ीड' : 'Feed', icon: <Home className="h-5 w-5" /> }, // Feed link removed
    // { href: '/discover', label: currentLanguage === 'hi' ? 'खोजें' : 'Discover', icon: <Search className="h-5 w-5" /> }, // Discover link removed
    { href: '/post/create', label: currentLanguage === 'hi' ? 'बनाएं' : 'Create', icon: <PlusSquare className="h-5 w-5" /> },
    { href: '/mandi', label: currentLanguage === 'hi' ? 'मंडी' : 'Mandi', icon: <Store className="h-5 w-5" /> },
    { href: `/profile/${MOCK_USER_ID}`, label: currentLanguage === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: <UserProfileIcon className="h-5 w-5" /> },
  ], [currentLanguage]);

  const secondaryNavLinks = useMemo((): NavLink[] => [
    { href: '/crop-science', label: currentLanguage === 'hi' ? 'फसल विज्ञान' : 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
    { href: '/fungicides', label: currentLanguage === 'hi' ? 'कवकनाशी' : 'Fungicides', icon: <SprayCan className="h-5 w-5" /> },
    { href: '/insecticides', label: currentLanguage === 'hi' ? 'कीटनाशक' : 'Insecticides', icon: <Bug className="h-5 w-5" /> },
    { href: '/irac-code', label: currentLanguage === 'hi' ? 'IRAC कोड' : 'IRAC code', icon: <Code2 className="h-5 w-5" /> },
    { href: '/frac-code', label: currentLanguage === 'hi' ? 'FRAC कोड' : 'FRAC code', icon: <Code2 className="h-5 w-5" /> },
    { href: '/ai-features', label: currentLanguage === 'hi' ? 'AI सुविधाएँ' : 'AI Features', icon: <Brain className="h-5 w-5" /> },
  ], [currentLanguage]);

  const settingsLabel = useMemo(() => (currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'), [currentLanguage]);


  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col",
        "fixed left-0 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out z-30 shadow-lg",
        "top-16", // Positioned below the TopHeader
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64' // Slides in and out
      )}
    >
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {mainNavLinks.map((link) => (
          <NavLinkItem
            key={link.href} 
            link={link}
            isActive={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1)}
            isSidebarOpen={isSidebarOpen}
            onClick={closeSidebar}
          />
        ))}
        <Separator className="my-3" />
        {secondaryNavLinks.map((link) => (
           <NavLinkItem
            key={link.href}
            link={link}
            isActive={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1)}
            isSidebarOpen={isSidebarOpen}
            onClick={closeSidebar}
          />
        ))}
      </div>

      <div className="mt-auto p-2 space-y-2 border-t">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-3",
                  !isSidebarOpen && "justify-center px-0"
                )}
                asChild
              >
                <Link href="/settings" onClick={closeSidebar}>
                  <SettingsIcon className="h-5 w-5" />
                  {isSidebarOpen && <span>{settingsLabel}</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {!isSidebarOpen && (
              <TooltipContent side="right" className="bg-background text-foreground border">
                <p>{settingsLabel}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Separator />

        {mockUser && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Link
                  href={`/profile/${mockUser.id}`}
                  className={cn(
                    "flex items-center gap-3 group p-2 rounded-md hover:bg-muted",
                    !isSidebarOpen && "justify-center"
                  )}
                  onClick={closeSidebar}
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer"/>
                    <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                  </Avatar>
                  {isSidebarOpen && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
                      <span className="text-xs text-muted-foreground truncate">@{mockUser.username}</span>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {!isSidebarOpen && (
                 <TooltipContent side="right" className="bg-background text-foreground border">
                  <p>{userNameDisplay}</p>
                  <p className="text-xs text-muted-foreground">@{mockUser.username}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}
