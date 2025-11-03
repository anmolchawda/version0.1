'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a user profile
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  // ... any other fields
}

interface ProfileContextType {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  userProfile: null,
  isProfileLoading: true,
});

// The inner logic component
function ProfileProviderLogic({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      // Don't do anything if auth is loading or there's no user
      if (isAuthLoading || !user) {
        if (!isAuthLoading) {
          setIsProfileLoading(false);
          setUserProfile(null);
        }
        return;
      }

      console.log(`[ProfileProvider] User authenticated (${user.uid}). Checking for profile...`);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const action = searchParams.get('action');

      if (userDocSnap.exists()) {
        // --- PROFILE FOUND (EXISTING USER) ---
        console.log('[ProfileProvider] Profile document exists. Loading profile.');
        const profileData = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
        setUserProfile(profileData);
        // The main AuthContext will handle redirecting them away from /login or /signup
      } else {
        // --- PROFILE NOT FOUND (NEW USER) ---
        console.log('[ProfileProvider] Profile document does NOT exist.');
        
        // Check the user's intent from the URL
        if (action === 'signup') {
          // USER INTENDED TO SIGN UP. They are in the right place.
          console.log('[ProfileProvider] Action was "signup". Allowing user to stay on signup page.');
          // The signup page component will handle profile creation.
        } else { // This includes action === 'login' or no action at all
          // USER INTENDED TO LOG IN, BUT HAS NO ACCOUNT.
          console.log('[ProfileProvider] Action was "login". User has no profile. Redirecting to signup.');
          toast({
            title: "Account Not Found",
            description: "Please create an account to continue.",
            variant: "default",
          });
          router.replace('/signup');
        }
      }
      setIsProfileLoading(false);
    };

    checkUserProfile();
    // We only want this to run when the user object becomes available
  }, [user, isAuthLoading, router, searchParams, toast]);

  return (
    <ProfileContext.Provider value={{ userProfile, isProfileLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Main exported provider with Suspense wrapper
export function ProfileProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <ProfileProviderLogic>{children}</ProfileProviderLogic>
        </Suspense>
    );
}

// Custom hook to use the context
export const useProfile = () => useContext(ProfileContext);
