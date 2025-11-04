'use client';

import React, { createContext, useContext, useEffect, ReactNode, Suspense } from 'react';
import {  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/hooks/useLoading';

// A full screen loader, but now it will only be used when processing a native token.
const FullPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Authenticating...</p>
    </div>
);

// --- The public context no longer provides `isLoading` ---
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
const AuthContext = createContext<AuthContextType>({ user: null, setUser: () => {} });
export const useAuth = () => useContext(AuthContext);

// This is the inner component that does all the work.
function AuthProviderLogic({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // --- REFACTORED: Use the useLoading hook ---
  const { isLoading: isAuthenticating, startLoading: startAuthenticating, stopLoading: stopAuthenticating } = useLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect 1: One-time check for a native login token in the URL
  useEffect(() => {
    const idToken = searchParams.get('token');
    if (idToken) {
      // --- REFACTORED: Use startLoading function ---
      startAuthenticating();

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
          // --- REFACTORED: Use stopLoading function ---
          stopAuthenticating();
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
      // --- REFACTORED: Always stop loading on auth state change ---
      // This is safe because stopLoading is idempotent.
      stopAuthenticating();
    });
    return () => unsubscribe();
    // Run this effect only once, when the component mounts.
    // stopAuthenticating is stable and won't cause re-renders.
  }, [stopAuthenticating]);

  // Effect 3: Main redirection logic.
  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (user && isAuthPage) {
      console.log(`AuthContext: User is on auth page '${pathname}'. Redirecting to /.`);
      router.replace('/');
    }
    else if (!user && !isAuthPage) {
      console.log(`AuthContext: No user on protected page '${pathname}'. Redirecting to /login.`);
      router.replace('/login');
    }
  }, [user, pathname, router]);

  // --- RENDER LOGIC ---

  // 1. If we are actively processing a token from the native app, show the loader.
  if (isAuthenticating) {
    return <FullPageLoader />;
  }

  // 2. In ALL other cases, render the app immediately.
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// This is the main export. It wraps our logic component in a Suspense boundary,
// which is required by Next.js when using `useSearchParams`.
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AuthProviderLogic>{children}</AuthProviderLogic>
    </Suspense>
  );
}
