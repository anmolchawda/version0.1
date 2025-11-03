'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import {  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// A full screen loader, but now it will only be used when processing a native token.
const FullPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Authenticating...</p>
    </div>
);

// --- NEW: The public context no longer provides `isLoading` ---
interface AuthContextType {
  user: User | null;
}
const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuth = () => useContext(AuthContext);

// This is the inner component that does all the work.
function AuthProviderLogic({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // --- NEW: A different kind of loading state, only for the token callback ---
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect 1: One-time check for a native login token in the URL
  useEffect(() => {
    const idToken = searchParams.get('token');
    if (idToken) {
      // --- CHANGE: Set the new loading state to true ---
      // This is the ONLY time the FullPageLoader will be shown.
      setIsAuthenticating(true);

      const authenticateWithToken = async () => {
        try {
          console.log("AuthContext: Found ID token in URL query. Signing in...");
          router.replace(pathname, { scroll: false }); // Clean URL
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          console.log("AuthContext: signInWithCredential SUCCEEDED.");
          // onAuthStateChanged will handle setting the user and turning off the loader.
        } catch (error) {
          console.error("AuthContext: FAILED to sign in with credential:", error);
          // --- CHANGE: On failure, stop the new loader and go to login ---
          setIsAuthenticating(false);
          router.replace('/login');
        }
      };
      authenticateWithToken();
    }
    // This effect should only run once on initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: Main listener for all auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`AuthContext: onAuthStateChanged event fired. User is now: ${currentUser?.uid ?? 'null'}`);
      setUser(currentUser);
      // --- CHANGE: Turn off the new loader if it was active ---
      if (isAuthenticating) {
        setIsAuthenticating(false);
      }
    });
    return () => unsubscribe();
    // This effect should only depend on the state it controls.
  }, [isAuthenticating]);

  // Effect 3: Main redirection logic.
  useEffect(() => {
    // --- CHANGE: This logic no longer depends on `isLoading`. It runs continuously. ---
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // Scenario 1: User is logged in but is on an auth page (e.g., /login).
    // This happens right after a successful login. Redirect them to the main app.
    if (user && isAuthPage) {
      console.log(`AuthContext: User is on auth page '${pathname}'. Redirecting to /.`);
      router.replace('/');
    }
    // Scenario 2: User is NOT logged in and tries to access any page that ISN'T for auth.
    else if (!user && !isAuthPage) {
      console.log(`AuthContext: No user on protected page '${pathname}'. Redirecting to /login.`);
      router.replace('/login');
    }
    // In all other cases (logged-in user on a protected page, or logged-out user on an auth page),
    // no redirect is needed, so we do nothing.
  }, [user, pathname, router]);

  // --- NEW RENDER LOGIC ---

  // 1. If we are actively processing a token from the native app, show the loader.
  if (isAuthenticating) {
    return <FullPageLoader />;
  }

  // 2. In ALL other cases, render the app immediately.
  // This is what gets rid of the initial black screen.
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

// This is the main export. It wraps our logic component in a Suspense boundary,
// which is required by Next.js when using `useSearchParams`.
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    // The fallback here is for the Suspense boundary itself, not our logic.
    // It will likely never be seen by the user.
    <Suspense>
      <AuthProviderLogic>{children}</AuthProviderLogic>
    </Suspense>
  );
}
