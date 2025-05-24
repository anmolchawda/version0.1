// src/lib/navigation.ts
import React, { type ReactNode } from 'react'; // Ensure React is imported
import { Home as HomeIcon, Search, PlusSquare, Store, User } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode; 
}

// Mock user ID, replace with actual auth state in a real app
const MOCK_USER_ID = '1';

// Define icons as functional components
const FeedNavIcon = () => <HomeIcon className="h-6 w-6" />;
const DiscoverNavIcon = () => <Search className="h-6 w-6" />;
const CreateNavIcon = () => <PlusSquare className="h-6 w-6" />;
const MandiNavIcon = () => <Store className="h-6 w-6" />;
const ProfileNavIcon = () => <User className="h-6 w-6" />;

export const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Feed', icon: <FeedNavIcon /> },
  { href: '/discover', label: 'Discover', icon: <DiscoverNavIcon /> },
  { href: '/post/create', label: 'Create', icon: <CreateNavIcon /> },
  { href: '/mandi', label: 'Mandi', icon: <MandiNavIcon /> },
  { href: `/profile/${MOCK_USER_ID}`, label: 'Profile', icon: <ProfileNavIcon /> },
];
