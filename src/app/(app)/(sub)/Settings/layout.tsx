// src/app/(main)/(sub)/settings/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure you have this import
import type { ReactNode } from 'react';

// =========================================================================
// === THE FIX IS HERE: We define the NavLink component right here.       ===
// =========================================================================
interface NavLinkProps {
  href: string;
  children: ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "pb-2 text-sm font-medium transition-colors",
        "border-b-2",
        isActive
          ? "border-primary text-primary" // Style for the active link
          : "border-transparent text-muted-foreground hover:text-foreground" // Style for inactive links
      )}
    >
      {children}
    </Link>
  );
};
// --- End of the fix ---


export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center border-b pb-4">
        {/* Back button that only shows on mobile */}
        <Link href="/feed" className="p-2 md:hidden mr-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Sub-navigation Menu for Settings */}
      <div className="flex space-x-6 mb-8">
        <NavLink href="/settings/account">Account</NavLink>
        <NavLink href="/settings/language">Language</NavLink>
        <NavLink href="/settings/notifications">Notifications</NavLink>
      </div>

      {/* The actual page content (e.g., the account form) will be rendered here */}
      <div>
        {children}
      </div>
    </div>
  );
}
