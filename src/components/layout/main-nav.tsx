
// src/components/layout/main-nav.tsx
// This component is no longer used.
// It will be empty.
import type { NavLink } from '@/types'; // Keep type import if other files might still reference it indirectly
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MainNavProps {
  currentPath: string;
  navLinks: NavLink[];
  className?: string;
}

export function MainNav({ currentPath, navLinks, className }: MainNavProps) {
  return null;
}

