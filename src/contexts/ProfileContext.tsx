'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';import { useAuth } from './AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a user profile
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  // This field is important for the final redirect logic
  profileSetupComplete?: boolean;
}

interface ProfileContextType {
  userProfile: UserProfile | null;
  // This loading state is for components to know when the profile data is ready
  isProfileLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  userProfile: null,
  isProfileLoading: true,
});

// The inner logic component that can use React hooks
function ProfileProviderLogic({ children }: { children: ReactNode }) {
  // We no longer get `isAuthLoading` because the new AuthContext doesn't provide it
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      // If there's no authenticated user, there's no profile to load.
      if (!user) {
        setUserProfile(null);
        setIsProfileLoading(false);
        return;
      }

      // If there IS a user, we begin the process of loading their profile.
      setIsProfileLoading(true);
      console.log(`[ProfileProvider] User authenticated (${user.uid}). Checking Firestore for profile...`);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // --- PROFILE FOUND (EXISTING USER) ---
        console.log('[ProfileProvider] Profile document FOUND.');
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        // If their profile setup isn't marked as complete, and they are not already
        // on the language page, send them there as the final step of onboarding.
        if (!profile.profileSetupComplete && pathname !== '/settings/language') {
            console.log('[ProfileProvider] Profile setup is not complete. Redirecting to /settings/language.');
            router.replace('/settings/language');
        }

      } else {
        // --- PROFILE NOT FOUND (NEW USER) ---
        console.log('[ProfileProvider] Profile document NOT found.');
        setUserProfile(null);
        const action = searchParams.get('action');

        if (action === 'signup') {
          // The user INTENDED to sign up. Keep them on the /signup page to complete their profile.
          console.log('[ProfileProvider] Action was "signup". Keeping user on signup page.');
          if (pathname !== '/signup') {
             router.replace('/signup');
          }
        } else {
          // The user INTENDED to LOG IN but has no account. Redirect them to sign up.
          console.log('[ProfileProvider] Action was "login" or null. User has no profile. Redirecting to signup.');
          toast({
            title: "Account Not Found",
            description: "Please create an account to continue.",
          });
          router.replace('/signup');
        }
      }
      // We're done with the profile check.
      setIsProfileLoading(false);
    };

    checkUserProfile();
    // This effect runs whenever the user object changes or the user navigates to a new page.
  }, [user, pathname, router, searchParams, toast]);

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

// Custom hook to easily consume the context in your components
export const useProfile = () => useContext(ProfileContext);
