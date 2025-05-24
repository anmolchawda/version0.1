
// src/lib/navigation.ts
import React, { type ReactNode, type ComponentType } from 'react';
import { Home as HomeIcon, Search, PlusSquare, Store, User } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>; // Icon is a component type
  activeIcon?: ComponentType<{ className?: string }>; 
}

// Mock user ID, replace with actual auth state in a real app
const MOCK_USER_ID = '1';

// Define icons as functional components using regular function declarations
export function FeedNavIcon({ className }: { className?: string }) {
  return (<HomeIcon className={className || "h-6 w-6"} />);
}
export function DiscoverNavIcon({ className }: { className?: string }) {
  return (<Search className={className || "h-6 w-6"} />);
}
export function CreateNavIcon({ className }: { className?: string }) {
  return (<PlusSquare className={className || "h-6 w-6"} />);
}
export function MandiNavIcon({ className }: { className?: string }) {
  return (<Store className={className || "h-6 w-6"} />);
}
export function ProfileNavIcon({ className }: { className?: string }) {
  return (<User className={className || "h-6 w-6"} />);
}

export const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Feed', icon: FeedNavIcon },
  { href: '/discover', label: 'Discover', icon: DiscoverNavIcon },
  { href: '/post/create', label: 'Create', icon: CreateNavIcon },
  { href: '/mandi', label: 'Mandi', icon: MandiNavIcon },
  { href: `/profile/${MOCK_USER_ID}`, label: 'Profile', icon: ProfileNavIcon },
];
