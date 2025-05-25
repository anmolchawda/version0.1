// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/types';

// Mock user ID, replace with actual auth state logic if available
const MOCK_USER_ID = '1';

const navLinks: NavLink[] = [
  { href: '/', label: 'Feed', icon: <Home className="h-6 w-6" /> },
  { href: '/discover', label: 'Discover', icon: <Search className="h-6 w-6" /> },
  { href: '/post/create', label: 'Create', icon: <PlusSquare className="h-6 w-6" /> },
  { href: '/mandi', label: 'Mandi', icon: <Store className="h-6 w-6" /> },
  { href: `/profile/${MOCK_USER_ID}`, label: 'Profile', icon: <User className="h-6 w-6" /> },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background shadow-top">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors duration-150 ease-in-out hover:bg-accent/50 active:bg-accent/70',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {link.icon}
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
