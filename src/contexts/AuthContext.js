'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react'; // For a loading spinner

const AuthContext = createContext({
  user: null,
  authStatus: 'loading',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'

  useEffect(() => {
    // onAuthStateChanged is the single source of truth for auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthStatus('authenticated');
        console.log("AuthContext: User is authenticated.", user.uid);
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
        console.log("AuthContext: User is not authenticated.");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // While loading, show a full-page spinner to prevent any rendering or redirects
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
