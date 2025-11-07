// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '@/lib/firebase';

// Import ALL icons you need for both sets of navigation
import {
  Home, Cpu, PlusSquare, Store, User as UserIcon,
  FlaskConical, CloudSun, BookOpen, Calendar, Bug, Binary, Settings, LogOut, Loader2
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type NavLink = { href: string; label: string; icon: React.ReactNode; };

// --- NAVIGATION DATA (Organized into logical groups) ---
const PRIMARY_LINKS: NavLink[] = [
  { href: '/feed', label: 'Feed', icon: <Home className="h-5 w-5" /> },
  { href: '/ai-features', label: 'AI Features', icon: <Cpu className="h-5 w-5" /> },
  { href: '/post/create', label: 'Create', icon: <PlusSquare className="h-5 w-5" /> },
  { href: '/mandi', label: 'Mandi', icon: <Store className="h-5 w-5" /> },
  { href: '/my-profile', label: 'My Profile', icon: <UserIcon className="h-5 w-5" /> },
];

const SECONDARY_LINKS: NavLink[] = [
  { href: '/crop-science', label: 'Crop Science', icon: <FlaskConical className="h-5 w-5" /> },
  { href: '/weather', label: 'Weather', icon: <CloudSun className="h-5 w-5" /> },
  { href: '/yojna', label: 'Yojna', icon: <BookOpen className="h-5 w-5" /> },
  { href: '/events', label: 'Events', icon: <Calendar className="h-5 w-5" /> },
  { href: '/fungicides', label: 'Fungicides', icon: <Bug className="h-5 w-5" /> },
  { href: '/insecticides', label: 'Insecticides', icon: <Bug className="h-5 w-5" /> },
  { href: '/irac-code', label: 'IRAC Code', icon: <Binary className="h-5 w-5" /> },
  { href: '/frac-code', label: 'FRAC Code', icon: <Binary className="h-5 w-5" /> },
];

const SETTINGS_LINK: NavLink = {
  href: '/settings/account', label: 'Settings', icon: <Settings className="h-5 w-5" />,
};

// --- Reusable NavLink Component ---
const NavLinkItem = ({ href, label, icon }: NavLink) => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();
  const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));

  // On mobile, close the sidebar when a link is clicked.
  const handleClick = () => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={cn(
      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    )}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

// --- THE MAIN SIDEBAR COMPONENT ---
export function Sidebar() {
  const { authUserId } = useSidebarContext();
  const [profile, setProfile] = useState<any | null>(null); // Using 'any' to avoid type errors with Firestore data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUserId || !db) {
      setLoading(false);
      return;
    }
    const userDocRef = doc(db, 'users', authUserId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile in sidebar:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authUserId]);

  const handleLogout = async () => {
    const { auth } = await import('@/lib/firebase');
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable area for all navigation links */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="flex flex-col space-y-4">
          {/* Group 1: Primary Navigation */}
          <div className="space-y-1">
            {PRIMARY_LINKS.map((link) => <NavLinkItem key={link.href} {...link} />)}
          </div>

          {/* Divider */}
          <hr className="my-2 border-border/50" />

          {/* Group 2: Secondary Tools */}
          <div className="space-y-1">
            <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground/80">
              Tools & Resources
            </h3>
            {SECONDARY_LINKS.map((link) => <NavLinkItem key={link.href} {...link} />)}
          </div>
        </nav>
      </div>

      {/* Sticky Bottom Section of Sidebar */}
      <div className="border-t p-4">
        <div className="space-y-2">
          {/* Settings Link */}
          <NavLinkItem {...SETTINGS_LINK} />

          {/* Logout Button */}
          <Button variant="ghost" onClick={handleLogout} className="flex w-full justify-start space-x-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>

          {/* User Profile Block */}
          {profile && (
            <Link href="/my-profile" className="mt-4 flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-foreground">{profile.displayName}</span>
                <span className="text-muted-foreground">@{profile.username}</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
