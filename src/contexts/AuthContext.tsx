'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import {  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
// ▼▼▼ STEP 1: IMPORT 'useSearchParams' to read URL query parameters ▼▼▼
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const FullPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111', color: 'white' }}>
        <p>Loading Application...</p>
    </div>
);

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });
export const useAuth = () => useContext(AuthContext);

// This is the inner component that does all the work.
// It needs to be separate so it can use the `useSearchParams` hook.
function AuthProviderLogic({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  // ▼▼▼ STEP 2: USE THE HOOK to get access to the URL's query string ▼▼▼
  const searchParams = useSearchParams();

  // This one-time effect handles the token from the native app
  useEffect(() => {
    // This function will only run once on initial load
    const handleNativeLogin = async () => {
      // ▼▼▼ STEP 3: READ THE TOKEN from '?token=' instead of '#' ▼▼▼
      const idToken = searchParams.get('token');

      if (idToken) {
        console.log("AuthContext: Found ID token in URL query. Preparing to sign in...");
        
        // Clean the URL by removing the query parameter.
        // This is the modern equivalent of the old window.history.replaceState.
        router.replace(pathname, { scroll: false });
        
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          console.log("AuthContext: signInWithCredential SUCCEEDED.");
          // The onAuthStateChanged listener below will now fire and set the user.
        } catch (error) {
          console.error("AuthContext: FAILED to sign in with credential:", error);
          setIsLoading(false); // On failure, stop the main loader.
        }
      } else {
        // No token was found. This is a normal web navigation, not a native login callback.
        // We can immediately stop the loading state related to the token check.
        setIsLoading(false);
      }
    };

    handleNativeLogin();
    // We only want this effect to run when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This effect listens for any change in Firebase's auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`AuthContext: onAuthStateChanged event fired. User is now: ${currentUser?.uid ?? 'null'}`);
      setUser(currentUser);
      // If the main loader is still active, we can now turn it off.
      if (isLoading) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isLoading]);

  // This effect handles protecting routes and redirecting the user
  useEffect(() => {
    if (isLoading) return; // Don't do anything until all auth checks are complete

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      console.log(`AuthContext: No user. Redirecting from protected page '${pathname}' to /login.`);
      router.replace('/login');
    }

    // This handles the case where a logged-in user tries to visit the login/signup page.
    // It also handles the successful login redirect.
    if (user && isAuthPage) {
      console.log(`AuthContext: User exists. Redirecting from auth page '${pathname}' to /.`);
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  // While loading, show a full-page loader.
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Once loaded, provide the user state to the rest of the app.
  return (
    <AuthContext.Provider value={{ user, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

// This is the main export. It wraps our logic component in a Suspense boundary,
// which is required by Next.js when using `useSearchParams`.
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AuthProviderLogic>{children}</AuthProviderLogic>
    </Suspense>
  );
}
