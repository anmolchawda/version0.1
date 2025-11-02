'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

/**
 * A client component dedicated to handling communication with the native Android shell.
 * This should be placed in the root layout to ensure it's always available.
 */
export function NativeAuthHandler() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // 1. Define the global callback function that the native Android app will call
    // after a sign-in attempt.
    window.onNativeGoogleSignInResult = (success, data) => {
      console.log(`NativeAuthHandler received sign-in result: success=${success}, data=`, data);
      
      if (success) {
        // The native app has handled the sign-in with Firebase.
        // We must now ensure the Firebase JS SDK's auth state is synchronized.
        auth.currentUser?.getIdToken(true)
          .then(() => {
            console.log("Firebase Web SDK token refreshed successfully after native sign-in.");
            // The onAuthStateChanged listener in the main layout will now detect the user
            // and handle the appropriate redirects or UI updates.
            // We can also give a welcome toast and a fallback redirect.
            toast({
                title: 'Sign-in Successful',
                description: `Welcome, ${data.email || 'friend'}!`,
            });
            router.push('/'); // Redirect to home page
          })
          .catch(error => {
            console.error("Error refreshing Firebase Web SDK token after native sign-in:", error);
            // Still attempt to redirect, as the user might be authenticated on the backend.
            router.push('/');
          });
      } else {
        console.error("Native Google Sign-In failed!", data);
        toast({
            title: 'Sign-in Failed',
            description: data.message || 'An error occurred during the native sign-in process.',
            variant: 'destructive'
        });
      }
    };

    // 2. Announce that the web app is ready and ask for the cached user.
    // The native shell listens for this event to know when it can send startup data.
    if (typeof window.Android?.onWebAppReady === 'function') {
        console.log("NativeAuthHandler: Web app is ready, notifying native shell.");
        window.Android.onWebAppReady();
    }


    // 3. Cleanup function to remove the global callback when the component unmounts.
    return () => {
      // @ts-ignore
      delete window.onNativeGoogleSignInResult;
    };
    // This effect should only run once to set up the global handlers.
  }, [router, toast]);

  // This component does not render anything to the DOM.
  return null;
}

// Define types for the Android interface for better type safety
declare global {
  interface Window {
    Android?: {
      requestGoogleSignIn: any;
      startNativeGoogleSignIn: () => void;
      onWebAppReady: () => void;
    };
    onNativeGoogleSignInResult: (success: boolean, data: any) => void;
  }
}
