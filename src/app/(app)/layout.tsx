// src/app/(app)/layout.tsx - The layout for authenticated pages

'use client';

import { useEffect, useState, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use the central auth hook
import { auth, db, doc, onSnapshot } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNavBar } from '@/components/layout/bottom-nav-bar';

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus: centralAuthStatus, user } = useAuth(); // Get status from the central provider

  // This is your DETAILED state, specific to authenticated users
  const [profileStatus, setProfileStatus] = useState<'loading' | 'needs_language' | 'needs_profile' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  // EFFECT 1: Redirect unauthenticated users
  useEffect(() => {
    if (centralAuthStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [centralAuthStatus, router]);

  // EFFECT 2: Check profile status ONLY if the user is authenticated
  useEffect(() => {
    // If the central auth provider says we have a user...
    if (user) {
      setProfileStatus('loading'); // Reset to loading when user changes
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef,
        (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (!userData.languageSelected) {
              setProfileStatus('needs_language');
            } else if (!userData.profileSetupComplete) {
              setProfileStatus('needs_profile');
            } else {
              setProfileStatus('ready');
            }
          } else {
            // New user, doc doesn't exist yet, needs language first
            setProfileStatus('needs_language');
          }
        },
        (profileError) => {
          console.error("Error fetching user profile:", profileError);
          setError("Could not verify your profile status.");
          setProfileStatus('loading');
        }
      );
      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [user]); // This effect re-runs ONLY when the user object changes

  // EFFECT 3: Perform redirects based on DETAILED profile status
  useEffect(() => {
    if (profileStatus === 'needs_language' && pathname !== '/settings/language') {
      router.replace('/settings/language');
    } else if (profileStatus === 'needs_profile' && pathname !== '/settings/account') {
      router.replace('/settings/account');
    }
  }, [profileStatus, pathname, router]);

  // RENDER LOGIC
  if (centralAuthStatus === 'loading' || (user && profileStatus === 'loading')) {
    return ( // A single, reliable loading state
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is fully ready, show the main app UI
  if (user && profileStatus === 'ready') {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader />
          <div className="p-4 md:p-8">{children}</div>
          <BottomNavBar />
        </main>
      </div>
    );
  }

  // If the user needs to complete a step, show the content for that specific page
  // (e.g., /settings/language or /settings/account) without the full UI.
  if (user && (profileStatus === 'needs_language' || profileStatus === 'needs_profile')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
         {children}
      </div>
    );
  }

  // Default fallback (shouldn't be reached if logic is correct)
  return null;
}
