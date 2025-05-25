// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import { AppLogo } from '@/components/core/app-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  ChevronLeft,
  Menu, // For opening when fully collapsed
  FlaskConical,
  SprayCan,
  Bug,
  Code2,
  Brain,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_USER_ID = '1';

// Secondary navigation links (the ones that will be hidden when fully collapsed)
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
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(true); // Start fully collapsed

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';

  const handleToggleCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
        isFullyCollapsed ? 'w-[72px]' : 'w-64' // Adjusted collapsed width for logo icon + menu button
      )}
    >
      <div
        className={cn(
          "border-b",
          isFullyCollapsed
            ? "p-3 flex flex-col items-center space-y-3" // Column layout for collapsed: Logo above button
            : "p-4 flex items-center justify-between" // Row layout for expanded
        )}
      >
        <AppLogo
          iconClassName="h-8 w-8" // Consistent icon size
          textClassName={cn(isFullyCollapsed ? "hidden" : "text-xl")} // Hide text when fully collapsed
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className={cn(
            "h-8 w-8", // Consistent button size
            isFullyCollapsed ? "mt-1" : "" // Add some space below logo if collapsed
          )}
          aria-label={isFullyCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isFullyCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">{isFullyCollapsed ? "Open sidebar" : "Close sidebar"}</span>
        </Button>
      </div>

      {/* Conditionally render the rest of the sidebar content */}
      {!isFullyCollapsed && (
        <>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {secondaryNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href.length > 1);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
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
              <Link href="/profile/edit">
                <SettingsIcon className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
            <Separator />
            {mockUser && (
              <Link
                href={`/profile/${mockUser.id}`}
                className="flex items-center gap-3 group p-2 rounded-md hover:bg-muted"
              >
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer" />
                  <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium group-hover:text-primary truncate">{userNameDisplay}</span>
                  <span className="text-xs text-muted-foreground truncate">@{mockUser.username}</span>
                </div>
              </Link>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
