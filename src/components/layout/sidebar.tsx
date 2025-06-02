
// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types'; // User type may not be fully populated from auth alone
import { getPlaceholderUser } from '@/lib/placeholders'; // Keep for fallback data if needed
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
  LogOut, // Import LogOut icon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth'; // Import signOut
import { useToast } from '@/hooks/use-toast';

const MOCK_USER_ID_FALLBACK = '1'; // Fallback if auth user is not available

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
  const router = useRouter();
  const { toast } = useToast();
  const { isSidebarOpen, closeSidebar, authUserId } = useSidebarContext();
  
  // Get current Firebase auth user details for display
  const firebaseUser = auth.currentUser;
  const currentUserName = firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User';
  const currentUserAvatar = firebaseUser?.photoURL;
  const currentUserUsername = firebaseUser?.email?.split('@')[0] || 'krishix_user'; // Fallback username

  const userIdForProfile = authUserId || MOCK_USER_ID_FALLBACK;


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
  const logoutLabel = useMemo(() => (currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'), [currentLanguage]);

  const userAvatarFallback = currentUserName.substring(0, 2).toUpperCase();
  
  const handleLogout = async () => {
    closeSidebar(); // Close sidebar first
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login'); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

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

  const logoutButtonElement = (
     <Button
        variant={isSidebarOpen ? "destructive" : "ghost"}
        className={cn(
          "w-full justify-start gap-3",
          isSidebarOpen ? "bg-destructive/10 hover:bg-destructive/20 text-destructive" : "text-destructive hover:bg-destructive/10",
           !isSidebarOpen && "justify-center p-2 h-auto"
        )}
        onClick={handleLogout}
        aria-label={!isSidebarOpen ? logoutLabel : undefined}
      >
        <LogOut className="h-5 w-5" />
        {isSidebarOpen && <span>{logoutLabel}</span>}
      </Button>
  );

  const userProfileElement = (
    <Link
      href={`/profile/${userIdForProfile}`}
      className={cn(
        "flex items-center gap-3 group p-2 rounded-md hover:bg-muted",
        !isSidebarOpen && "justify-center"
      )}
      onClick={closeSidebar}
      aria-label={!isSidebarOpen ? `${currentUserName} Profile` : undefined}
    >
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={currentUserAvatar || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={currentUserName} data-ai-hint="person farmer"/>
        <AvatarFallback>{userAvatarFallback}</AvatarFallback>
      </Avatar>
      {isSidebarOpen && (
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium group-hover:text-primary truncate">{currentUserName}</span>
          <span className="text-xs text-muted-foreground truncate">@{currentUserUsername}</span>
        </div>
      )}
    </Link>
  );

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col",
        "fixed left-0 top-16 h-[calc(100vh-8rem)] shadow-lg", 
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
             <Tooltip>
              <TooltipTrigger asChild>{logoutButtonElement}</TooltipTrigger>
              {logoutLabel && (
                 <TooltipContent side="right" className="bg-background text-foreground border">
                    <p>{logoutLabel}</p>
                 </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            {settingsLinkElement}
            {logoutButtonElement}
          </>
        )}

        <Separator />

        {!isSidebarOpen ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{userProfileElement}</TooltipTrigger>
               {currentUserName && (
                  <TooltipContent side="right" className="bg-background text-foreground border">
                    <p>{currentUserName}</p>
                    {currentUserUsername && <p className="text-xs text-muted-foreground">@{currentUserUsername}</p>}
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
