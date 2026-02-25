'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const FullPageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  authStatus: 'loading',
  setUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

function AuthProviderLogic({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect 1: Handle native token authentication if present
  useEffect(() => {
    const idToken = searchParams.get('token');
    if (idToken) {
      // We found a token, so we are definitely in a loading state
      setAuthStatus('loading');
      const authenticateWithToken = async () => {
        try {
          console.log("AuthProvider: Found ID token, attempting to sign in...");
          // Clean the URL immediately
          router.replace(pathname, { scroll: false });
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          // Success! onAuthStateChanged will handle the rest.
          console.log("AuthProvider: signInWithCredential successful.");
        } catch (error) {
          console.error("AuthProvider: Failed to sign in with credential:", error);
          // If token-based auth fails, we are unauthenticated.
          setAuthStatus('unauthenticated');
        }
      };
      authenticateWithToken();
    }
  }, [pathname, router, searchParams]);

  // Effect 2: Main Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`AuthProvider: onAuthStateChanged triggered. User: ${currentUser?.uid}`);
      setUser(currentUser);
      setAuthStatus(currentUser ? 'authenticated' : 'unauthenticated');
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  // Render a full-page loader while the auth status is being determined.
  if (authStatus === 'loading') {
    return <FullPageLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

// Main export with Suspense boundary for useSearchParams
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AuthProviderLogic>{children}</AuthProviderLogic>
    </Suspense>
  );
}
