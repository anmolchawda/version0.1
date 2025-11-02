// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // ▼▼▼ NEW: We now read URL parameters ▼▼▼
  const searchParams = useSearchParams();
  const fromNativeLogin = searchParams.get('fromNativeLogin');

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // ▼▼▼ NEW: Add a small delay if we see the native login flag ▼▼▼
      if (fromNativeLogin && !firebaseUser) {
        // This is the special case: native login just happened, but the JS SDK hasn't caught up.
        // We wait a tiny bit for the user object to become available.
        console.log('AuthProvider: Native login flag detected, waiting for user session...');
        setTimeout(() => {
          // Re-check the user status after a short delay
          if (auth.currentUser) {
            console.log('AuthProvider: User session is now available after delay.');
            setUser(auth.currentUser);
            setIsLoading(false);
          }
        }, 1500); // 1.5-second delay to be safe
        return;
      }
      
      // This is the normal flow for all other cases
      console.log('AuthProvider: Auth state changed. User:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  // We add fromNativeLogin to the dependency array
  }, [fromNativeLogin]);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until loading is complete
    }

    // Logic 1: If we have a user, and they are on an auth page, redirect them to the feed.
    if (user && isAuthPage) {
      console.log(`AuthProvider: Logged-in user on auth page (${pathname}). Redirecting to /feed.`);
      router.replace('/feed');
    }

    // Logic 2: If we DON'T have a user, and they are NOT on an auth page, force them to login.
    if (!user && !isAuthPage) {
      console.log(`AuthProvider: Logged-out user on protected page (${pathname}). Redirecting to /login.`);
      router.replace('/login');
    }
    
  }, [user, isLoading, pathname, router, isAuthPage]);

  // Show a loading screen while Firebase is initializing.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If everything is loaded and the redirects have been handled, render the page.
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
