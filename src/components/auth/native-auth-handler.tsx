
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

/**
 * A client component dedicated to handling the callback from native Android Google Sign-In.
 * This should be placed in the root layout to ensure it's always available.
 */
export function NativeAuthHandler() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Define the global callback function that the native Android app will call.
    window.onNativeGoogleSignInResult = (success, data) => {
      console.log(`NativeAuthHandler received sign-in result: success=${success}, data=`, data);
      
      if (success) {
        // The native app has handled the sign-in with Firebase.
        // We must now ensure the Firebase JS SDK's auth state is synchronized.
        auth.currentUser?.getIdToken(true)
          .then((idToken) => {
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

    // Cleanup function to remove the global callback when the component unmounts.
    return () => {
      // @ts-ignore
      delete window.onNativeGoogleSignInResult;
    };
    // The dependencies array is empty because this effect should only run once to set up the global handler.
  }, [router, toast]);

  // This component does not render anything to the DOM.
  return null;
}

// Define types for the Android interface for better type safety
declare global {
  interface Window {
    Android?: {
      startNativeGoogleSignIn: () => void;
    };
    onNativeGoogleSignInResult: (success: boolean, data: any) => void;
  }
}
