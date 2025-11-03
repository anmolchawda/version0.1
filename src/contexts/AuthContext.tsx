// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {  User,
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

// A simple loader component you can style later
const FullPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111', color: 'white' }}>
        <p>Loading Application...</p>
    </div>
);

// --- The rest of the file is the new, robust logic ---

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
  
  // Use a ref to ensure the one-time token check doesn't run again on re-renders
  const tokenCheckRef = useRef(false);

  // --- Effect 1: One-Time Check for Native Login Token ---
  useEffect(() => {
    // Prevent this from running more than once
    if (tokenCheckRef.current) {
      return;
    }
    tokenCheckRef.current = true;

    const handleNativeLogin = async () => {
      // Check if the special token exists in the URL hash
      if (!window.location.hash.startsWith('#/login?token=')) {
        return; // No token found, proceed with normal auth flow
      }

      console.log("AuthContext: Found native token in URL. Preparing to sign in.");
      const token = window.location.hash.substring('#/login?token='.length);

      // Clean the URL hash immediately so it's not visible to the user
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      if (token) {
        try {
          // CRITICAL STEP 1: Force Firebase to save the session durably
          await setPersistence(auth, browserLocalPersistence);
          console.log("AuthContext: Persistence set to local. Signing in with custom token...");

          // CRITICAL STEP 2: Sign in using the token from the native app
          await signInWithCustomToken(auth, token);
          
          console.log("AuthContext: Custom token sign-in SUCCEEDED.");

          // The onAuthStateChanged listener will now naturally pick up the user.
          // We don't need to manually redirect here, as the other effects will handle it.

        } catch (error) {
          console.error("AuthContext: FAILED to sign in with custom token:", error);
          setIsLoading(false); // Stop loading on failure to allow redirect to /login
        }
      }
    };

    handleNativeLogin();
  }, [auth, router]);


  // --- Effect 2: Main Listener for Authentication State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`AuthContext: onAuthStateChanged event fired. User is now: ${currentUser?.uid ?? 'null'}`);
      setUser(currentUser);
      // Only set loading to false AFTER the first auth state is confirmed
      if (isLoading) {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, isLoading]);


  // --- Effect 3: Logic for Protecting Routes ---
  useEffect(() => {
    // Don't run route protection logic until auth state is confirmed
    if (isLoading) {
      return;
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // If there's no user and they are on a protected page, force them to login.
    if (!user && !isAuthPage) {
      console.log(`AuthContext: No user found. Redirecting from protected page '${pathname}' to /login.`);
      router.replace('/login');
    }

    // If there IS a user and they are on an auth page, send them to the main app.
    if (user && isAuthPage) {
      console.log(`AuthContext: Logged-in user found on auth page '${pathname}'. Redirecting to /.`);
      router.replace('/'); // Or '/feed' or your main app page
    }
    
  }, [user, isLoading, pathname, router]);

  // While Firebase is initializing, show a full-page loader
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Render the children once authentication is resolved
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

