// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AppLogo } from '@/components/core/app-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  ChevronLeft,
  ChevronRight,
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

// Mock user data, replace with actual auth state
const MOCK_USER_ID = '1';

const secondaryNavLinks: NavLink[] = [
  { href: '/crop-science', label: 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
  { href: '/fungicides', label: 'Fungicides', icon: <SprayCan className="h-5 w-5" /> },
  { href: '/insecticides', label: 'Insecticides', icon: <Bug className="h-5 w-5" /> },
  { href: '/irac-code', label: 'IRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/frac-code', label: 'FRAC code', icon: <Code2 className="h-5 w-5" /> },
  { href: '/ai-features', label: 'AI Features', icon: <Brain className="h-5 w-5" /> },
];


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const mockUser: User | undefined = getPlaceholderUser(MOCK_USER_ID);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn("p-4 border-b", isCollapsed ? "space-y-2" : "flex items-center justify-between")}>
        <div className={cn("flex flex-col w-full", isCollapsed ? "items-center" : "items-center")}>
          <AppLogo
            className={cn("h-10", isCollapsed ? "justify-center" : "")}
            iconClassName={isCollapsed ? "h-8 w-8" : ""}
            textClassName={isCollapsed ? "hidden" : ""}
          />
          {/* "KRISHIX" text removed from here */}
        </div>
        <Button variant="ghost" size="icon" onClick={handleCollapse} className={cn(isCollapsed ? "w-full mt-1" : "ml-auto -mr-2")}>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {secondaryNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1);
          return (
            <TooltipProvider key={link.label} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md text-sm font-medium transition-colors',
                      isCollapsed ? 'justify-center p-3 h-11 w-11' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span className={cn(isCollapsed && "flex items-center justify-center")}>{link.icon}</span>
                    {!isCollapsed && <span>{link.label}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>{link.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      <div className={cn("mt-auto p-2 space-y-2 border-t", isCollapsed && "px-2 py-3")}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(isCollapsed ? 'w-full h-11 p-0 justify-center' : 'w-full justify-start gap-3')}
                asChild
              >
                <Link href="/profile/edit">
                  <SettingsIcon className="h-5 w-5" />
                  {!isCollapsed && <span>Settings</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="ml-2">
                <p>Settings</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {!isCollapsed && <Separator />}

        {mockUser && (
           <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/profile/${mockUser.id}`}
                  className={cn(
                    "flex items-center gap-3 group p-2 rounded-md hover:bg-muted",
                    isCollapsed && "justify-center w-full h-11"
                  )}
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer" />
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
              {isCollapsed && (
                <TooltipContent side="right" className="ml-2">
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
