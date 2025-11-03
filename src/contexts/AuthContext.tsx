// src/contexts/AuthContext.tsx

'use client'; // <-- THIS MUST BE THE VERY FIRST LINE, BY ITSELF.

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  User,
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

// A simple loader component
const FullPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111', color: 'white' }}>
        <p>Loading Application...</p>
    </div>
);

// --- AuthContext and useAuth hook ---
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });
export const useAuth = () => useContext(AuthContext);

// --- The Final AuthProvider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const tokenCheckRef = useRef(false);

  // --- Effect 1: One-Time Check for Native Login Token ---
  useEffect(() => {
    if (tokenCheckRef.current) return;
    tokenCheckRef.current = true;

    const handleNativeLogin = async () => {
      if (!window.location.hash.startsWith('#/login?token=')) {
        setIsLoading(false); // If no token, stop loading and let the other effects run.
        return;
      }

      console.log("AuthContext: Found ID token in URL. Preparing to create credential.");
      const idToken = window.location.hash.substring('#/login?token='.length);
      
      // Clean the URL hash immediately
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      if (idToken) {
        try {
          // 1. Create a Google Auth credential using the ID token from the native app.
          const credential = GoogleAuthProvider.credential(idToken);
          console.log("AuthContext: Credential created. Signing in with credential...");

          // 2. Sign in the web SDK using this credential.
          await signInWithCredential(auth, credential);
          
          console.log("AuthContext: signInWithCredential SUCCEEDED.");
          // The onAuthStateChanged listener will now naturally pick up the user.

        } catch (error) {
          console.error("AuthContext: FAILED to sign in with credential:", error);
          setIsLoading(false); // Stop loading on failure
        }
      } else {
        setIsLoading(false); // No token, stop loading
      }
    };

    handleNativeLogin();
  }, [auth, router]);

  // --- Effect 2: Main Listener for Authentication State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`AuthContext: onAuthStateChanged event fired. User is now: ${currentUser?.uid ?? 'null'}`);
      setUser(currentUser);
      if (isLoading) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, isLoading]);

  // --- Effect 3: Logic for Protecting Routes ---
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      console.log(`AuthContext: No user. Redirecting from protected page '${pathname}' to /login.`);
      router.replace('/login');
    }

    if (user && isAuthPage) {
      console.log(`AuthContext: User exists. Redirecting from auth page '${pathname}' to /.`);
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  // While waiting for auth state, show a loader.
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Render the children once everything is resolved.
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

