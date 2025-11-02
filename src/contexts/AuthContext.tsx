// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Adjust path if needed
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (isLoading) {
      return; // Do nothing while loading
    }

    const isAuthPage = pathname === '/login';

    if (user && isAuthPage) {
      // User is logged in but on the login page, redirect to feed
      router.replace('/feed');
    } else if (!user && !isAuthPage) {
      // User is not logged in and not on the login page, redirect to login
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  // While loading, show a loading spinner or a blank screen
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        {/* You can replace this with a proper spinner component */}
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context in other components
export const useAuth = () => useContext(AuthContext);

