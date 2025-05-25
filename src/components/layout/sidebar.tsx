
// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppLogo } from '@/components/core/app-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { NavLink, User } from '@/types';
import { getPlaceholderUser } from '@/lib/placeholders';
import {
  ChevronLeft,
  FlaskConical, // For Crop Science
  SprayCan,    // For Fungicides
  Bug,         // For Insecticides
  Code2,       // For IRAC/FRAC code
  Brain,       // For AI
  Settings as SettingsIcon, // Renamed to avoid conflict
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock user data, replace with actual auth state
const MOCK_USER_ID = '1';

const sidebarNavLinks: NavLink[] = [
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

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';

  // For now, the collapse button is visual only
  const handleCollapse = () => {
    console.log("Sidebar collapse/expand toggled (visual only)");
  };

  return (
    <aside className="w-64 bg-card text-card-foreground border-r flex flex-col h-screen sticky top-0">
      <div className="p-4 flex flex-col items-center border-b">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-center w-full">
            <AppLogo className="h-10 w-auto" />
            <span className="text-sm font-semibold text-primary mt-1">KRISHIX</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCollapse} className="ml-auto -mr-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Collapse sidebar</span>
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
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

      <div className="mt-auto p-4 space-y-3 border-t">
        <Button variant="outline" className="w-full justify-start gap-3" asChild>
          <Link href="/profile/edit">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </Button>
        <Separator />
        {mockUser && (
          <Link href={`/profile/${mockUser.id}`} className="flex items-center gap-3 group p-2 rounded-md hover:bg-muted">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={mockUser.avatarUrl || `https://placehold.co/36x36.png?text=${userAvatarFallback}`} alt={userNameDisplay} data-ai-hint="person farmer" />
              <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium group-hover:text-primary">{userNameDisplay}</span>
              <span className="text-xs text-muted-foreground">@{mockUser.username}</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
