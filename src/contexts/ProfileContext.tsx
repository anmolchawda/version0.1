'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/useLoading';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  profileSetupComplete?: boolean;
}

interface ProfileContextType {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  userProfile: null,
  isProfileLoading: true,
});

// The inner logic component that uses the required hooks
function ProfileProviderLogic({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { isLoading: isProfileLoading, startLoading: startProfileLoading, stopLoading: stopProfileLoading } = useLoading(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      startProfileLoading();

      // If no user is authenticated, we just finish loading.
      if (!user) {
        setUserProfile(null);
        stopProfileLoading();
        return;
      }
      
      console.log(`[ProfileProvider] User authenticated (${user.uid}). Checking Firestore...`);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // --- PROFILE FOUND (EXISTING USER) ---
        console.log('[ProfileProvider] Profile document FOUND.');
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        // Final onboarding step check
        if (!profile.profileSetupComplete && pathname !== '/settings/language') {
            console.log('[ProfileProvider] Profile setup incomplete. Redirecting to /settings/language.');
            router.replace('/settings/language');
        }
      } else {
        // --- PROFILE NOT FOUND (NEW USER) ---
        // This is the most critical logic block for the new user experience.
        console.log('[ProfileProvider] Profile document NOT found for this user.');
        setUserProfile(null);
        const action = searchParams.get('action');

        if (action === 'login') {
            // THE USER INTENDED TO LOG IN.
            console.log('[ProfileProvider] New user attempted LOGIN. Showing error and signing out.');
            toast({
              title: "Account Not Found",
              description: "Please create an account to continue.",
              variant: "destructive",
            });
            // We must sign the user out of Firebase Auth, because they don't have a profile.
            // This prevents them from being in a weird "logged-in-but-no-profile" state.
            await signOut(auth);
            // Since the user is signed out, AuthContext will handle keeping them on the login page.
        } else {
            // THE USER INTENDED TO SIGN UP (or the action is unknown).
            // Send them to the signup page to complete their profile.
            if (pathname !== '/signup') {
                console.log('[ProfileProvider] New user needs to create a profile. Redirecting to /signup.');
                router.replace('/signup');
            }
        }
      }

      stopProfileLoading();
    };

    checkUserProfile();
  }, [user, pathname, searchParams, router, toast, startProfileLoading, stopProfileLoading]);

  return (
    <ProfileContext.Provider value={{ userProfile, isProfileLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Main exported provider with the required Suspense wrapper for useSearchParams
export function ProfileProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <ProfileProviderLogic>{children}</ProfileProviderLogic>
        </Suspense>
    );
}

// Custom hook to easily consume the context
export const useProfile = () => useContext(ProfileContext);
