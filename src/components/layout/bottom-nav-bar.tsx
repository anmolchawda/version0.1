
// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/lib/navigation';

interface BottomNavBarProps {
  links: NavLink[];
}

export function BottomNavBar({ links }: BottomNavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background shadow-sm md:hidden">
      <div className="grid h-full grid-cols-5 mx-auto">
        {links.map((link) => {
          const IconComponent = link.icon;
          // More specific active check: exact match for root, startsWith for others.
          const isActive = (pathname === '/' && link.href === '/') || 
                           (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-1 pt-1 pb-1.5 hover:bg-muted group focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <IconComponent className="h-6 w-6" />
              <span
                className={cn(
                  'text-[10px] leading-tight mt-0.5', // Smaller text, tighter leading
                  isActive ? 'font-semibold' : 'font-normal',
                  // 'group-hover:text-primary' // Optional: text color change on hover
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

