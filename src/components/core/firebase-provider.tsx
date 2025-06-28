// src/components/core/firebase-provider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { initializeFirestore, persistentLocalCache, memoryLocalCache } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// This provider component safely enables Firestore offline persistence on the client-side.
// It should wrap the application in the root layout.
export function FirebaseProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // This effect runs once on the client after the initial render.
    try {
      // getApp() retrieves the app instance initialized in firebase.ts
      initializeFirestore(getApp(), {
        localCache: persistentLocalCache({}),
      });
    } catch (error) {
      // This can happen in browsers that don't support persistence (e.g., private mode in Firefox).
      // We fall back to in-memory cache in that case.
      console.warn("Firebase: Could not initialize Firestore with persistent cache. Falling back to memory cache.", error);
      try {
         initializeFirestore(getApp(), {
            localCache: memoryLocalCache(),
          });
      } catch (fallbackError) {
          console.error("Firebase: Failed to initialize even with memory cache.", fallbackError);
      }
    }
  }, []);

  return <>{children}</>;
}
