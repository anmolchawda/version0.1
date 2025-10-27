'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase';
// Make sure to import the User type from the firebase/auth SDK
import { onAuthStateChanged, type User } from 'firebase/auth'; 
import { Loader2 } from 'lucide-react';

// 1. Define the "shape" of our context data
interface AuthContextType {
  user: User | null; // The user can be a Firebase User object or null
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

// 2. Create the context with a default value that matches the type.
//    We use 'as' here to tell TypeScript to trust us about the default shape.
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  authStatus: 'loading' 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // 3. The state now correctly uses the User type
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // This is a User object
        setAuthStatus('authenticated');
        console.log("AuthContext: User is authenticated.", firebaseUser.uid);
      } else {
        setUser(null); // This is null
        setAuthStatus('unauthenticated');
        console.log("AuthContext: User is not authenticated.");
      }
    });

    return () => unsubscribe();
  }, []);

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

// 4. The hook now provides proper types, so other components know about 'user.uid' etc.
export const useAuth = () => useContext(AuthContext);
