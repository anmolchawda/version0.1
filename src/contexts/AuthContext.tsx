// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

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

  // ▼▼▼ DEFINE isAuthPage HERE so it's accessible everywhere ▼▼▼
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthProvider: Auth state changed. User:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until loading is complete
    }

    // Logic 1: If we have a user, but they are on an auth page, redirect them away.
    if (user && isAuthPage) {
      console.log(`AuthProvider: Logged-in user on auth page (${pathname}). Redirecting to /feed.`);
      router.replace('/feed');
    }

    // Logic 2: If we DON'T have a user, and they are NOT on an auth page, force them to login.
    if (!user && !isAuthPage) {
      console.log(`AuthProvider: Logged-out user on protected page (${pathname}). Redirecting to /login.`);
      router.replace('/login');
    }
    
  }, [user, isLoading, pathname, router, isAuthPage]); // Added isAuthPage to dependency array

  // Show a loading screen while Firebase is initializing.
  // This prevents any "flash" of the wrong content.
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

