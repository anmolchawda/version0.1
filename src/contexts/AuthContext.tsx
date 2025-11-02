'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // <-- 1. IMPORT THESE
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth'; 
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  authStatus: 'loading' 
});

// List of pages that do not require a user to be logged in
const PUBLIC_ROUTES = ['/login', '/signup']; // <-- 2. ADD THIS LIST

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const router = useRouter();   // <-- 3. ADD ROUTER
  const pathname = usePathname(); // <-- 4. ADD PATHNAME

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthStatus('authenticated');
        console.log("AuthContext: User is authenticated.", firebaseUser.uid);
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
        console.log("AuthContext: User is not authenticated.");
      }
    });

    return () => unsubscribe();
  }, []);

  // ================================================================
  // ▼▼▼ THIS IS THE NEW LOGIC THAT FIXES THE REDIRECTION PROBLEM ▼▼▼
  // ================================================================
  useEffect(() => {
    // Wait until we know for sure if the user is logged in or not.
    if (authStatus === 'loading') {
      return; 
    }

    const isPublicPage = PUBLIC_ROUTES.includes(pathname);

    // If user is LOGGED OUT but on a PROTECTED page...
    if (authStatus === 'unauthenticated' && !isPublicPage) {
      console.log('Redirecting logged-out user to login page...');
      router.replace('/login'); // ...kick them to the login screen.
    }

    // If user is LOGGED IN but on a PUBLIC page (like /login)...
    if (authStatus === 'authenticated' && isPublicPage) {
      console.log('Redirecting logged-in user to home page...');
      router.replace('/'); // ...send them to the main app screen.
    }

  }, [authStatus, pathname, router]); // This runs when auth status or page changes
  // ================================================================
  // ▲▲▲ END OF THE NEW LOGIC ▲▲▲
  // ================================================================


  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Initializing...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
