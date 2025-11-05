// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { User, NavLink as NavLinkType } from '@/types';
import {
  FlaskConical,
  SprayCan,
  Bug,
  Code2,
  Settings as SettingsIcon,
  ScrollText,
  CloudSun,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { auth, db, doc, getDoc } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { Skeleton } from '@/components/ui/skeleton';

interface NavLinkItemProps {
  href: string;
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  isSidebarOpen: boolean;
  itemClassName?: string;
  ariaLabel?: string;
  badgeCount?: number;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ href, label, icon, isActive, isSidebarOpen, itemClassName, ariaLabel, badgeCount }) => {
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
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative',
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
      {isSidebarOpen && badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-auto h-5 min-w-[1.25rem] px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  );

  if (!isSidebarOpen) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              {linkElement}
              {badgeCount !== undefined && badgeCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 min-w-[1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center pointer-events-none">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
          </TooltipTrigger>
          {label && (
            <TooltipContent side="right" className="bg-background text-foreground border">
              <p>{label} {badgeCount !== undefined && badgeCount > 0 ? `(${badgeCount})` : ''}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }
  return linkElement;
};

function SidebarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { isSidebarOpen, closeSidebar, authUserId } = useSidebarContext();
  const { t } = useTranslations();
  
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!authUserId || !db) {
      setIsLoadingProfile(false);
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const userDocRef = doc(db, 'users', authUserId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserDetails({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        } else {
          setCurrentUserDetails(null);
        }
      } catch (error) {
        console.error("Error fetching user profile for sidebar:", error);
        setCurrentUserDetails(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [authUserId]);

  const currentUserName = currentUserDetails?.name || currentUserDetails?.username || 'User';
  const currentUserAvatar = currentUserDetails?.avatarUrl;
  const currentUserUsername = currentUserDetails?.username || 'krishix_user';

  const userProfileLink = "/my-profile";

  const primaryNavLinks = useMemo((): NavLinkType[] => [], []);

  const secondaryNavLinks = useMemo((): NavLinkType[] => [
    { href: '/crop-science', label: t('cropScience'), icon: <FlaskConical /> },
    { href: '/weather', label: t('weather'), icon: <CloudSun /> },
    { href: '/yojna', label: t('yojna'), icon: <ScrollText /> },
    { href: '/events', label: t('events'), icon: <CalendarDays /> },
    { href: '/fungicides', label: t('fungicides'), icon: <SprayCan /> },
    { href: '/insecticides', label: t('insecticides'), icon: <Bug /> },
    { href: '/irac-code', label: t('iracCode'), icon: <Code2 /> },
    { href: '/frac-code', label: t('fracCode'), icon: <Code2 /> },
  ], [t]);

  const settingsLabel = useMemo(() => t('settings'), [t]);
  const logoutLabel = useMemo(() => t('logout'), [t]);

  const userAvatarFallback = currentUserName.substring(0, 2).toUpperCase();
  
  const handleLogout = async () => {
    closeSidebar();
    if (!auth) {
      toast({ title: 'Logged Out (Mock)', description: 'You have been successfully logged out.' });
      router.push('/login');
      return;
    }
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login'); 
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
        <LogOut className={cn("h-5 w-5", isSidebarOpen && "mr-2")} />
        {isSidebarOpen && <span>{logoutLabel}</span>}
      </Button>
  );

  const renderUserProfile = () => {
    if (isLoadingProfile) {
      return (
        <div className={cn("flex items-center gap-3 p-2", !isSidebarOpen && "justify-center")}>
          <Skeleton className="h-9 w-9 rounded-full" />
          {isSidebarOpen && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[70px]" />
            </div>
          )}
        </div>
      );
    }

    if (!currentUserDetails) return null; // Don't show anything if profile doesn't exist

    return (
      <Link
        href={userProfileLink}
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
  };

  const userProfileElement = renderUserProfile();

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex-col",
        "fixed left-0 top-0 h-full shadow-lg z-40 md:z-30",
        "transition-transform duration-300 ease-in-out",
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-20 md:translate-x-0'
      )}
    >
       <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {primaryNavLinks.length > 0 && (
          <>
            {primaryNavLinks.map((link) => (
            <NavLinkItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon || <span></span>}
                isActive={pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/' && link.href.length > 1)}
                isSidebarOpen={isSidebarOpen}
                ariaLabel={link.label}
                badgeCount={link.badgeCount}
            />
            ))}
            <Separator className="my-2"/>
          </>
        )}
        {secondaryNavLinks.map((link) => (
           <NavLinkItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon || <span></span>}
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

export const Sidebar = React.memo(SidebarComponent);
