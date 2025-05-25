// src/components/layout/app-header.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // usePathname removed as it's not used here anymore
import { AppLogo } from '@/components/core/app-logo';
// MainNav and MobileNav are removed
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, User, Settings, LogOut } from 'lucide-react'; // Removed Home, PlusSquare, Store
import { getPlaceholderUser } from '@/lib/placeholders';
import type { User as UserType } from '@/types'; // NavLink import removed

// Mock user data, replace with actual auth state
const MOCK_USER_ID = '1';

export function AppHeader() {
  const router = useRouter();
  // const pathname = usePathname(); // No longer needed here

  const mockUser: UserType | undefined = getPlaceholderUser(MOCK_USER_ID);

  const handleLogout = () => {
    localStorage.removeItem('isMockAuthenticated');
    router.push('/login');
  };

  const userAvatarFallback = mockUser?.username ? mockUser.username.substring(0, 2).toUpperCase() : 'U';
  const userNameDisplay = mockUser?.name || mockUser?.username || 'FARMDOCC User';
  const userHandleDisplay = mockUser?.username ? `@${mockUser.username}` : 'user@farmdocc.com';

  // navLinks definition is removed from here

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-xl mx-auto px-4">
        <div className="flex items-center gap-6">
          <AppLogo />
          {/* MainNav removed from here */}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Optional: Keep search icon in header if desired, or move to Discover page / bottom nav */}
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/discover"> {/* Assuming Search icon links to Discover page */}
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={mockUser?.avatarUrl || `https://placehold.co/40x40.png?text=${userAvatarFallback}`} alt={mockUser?.username || "User Avatar"} data-ai-hint="person farmer" />
                  <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userNameDisplay}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userHandleDisplay}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${MOCK_USER_ID}`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/edit">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* MobileNav removed from here */}
        </div>
      </div>
    </header>
  );
}
