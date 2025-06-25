
// src/components/layout/mobile-nav.tsx
// This component is no longer used.
// It will be empty.
import type React from 'react'; // Keep type import
import type { NavLink } from '@/types'; // Keep type import

interface MobileNavProps {
  navLinks: NavLink[];
  onLinkClick?: () => void;
}

export function MobileNav({ navLinks, onLinkClick }: MobileNavProps) {
  return null;
}
