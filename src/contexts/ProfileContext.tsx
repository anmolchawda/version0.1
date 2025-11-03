'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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

function ProfileProviderLogic({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      // If the user is unauthenticated, but trying to go to the signup page, let them.
      // This fixes the button on the login page.
      if (!user && pathname === '/signup') {
        setIsProfileLoading(false);
        return;
      }
      
      if (!user) {
        setUserProfile(null);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      console.log(`[ProfileProvider] User authenticated (${user.uid}). Checking Firestore for profile...`);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        console.log('[ProfileProvider] Profile document FOUND.');
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        if (!profile.profileSetupComplete && pathname !== '/settings/language') {
            console.log('[ProfileProvider] Profile setup is not complete. Redirecting to /settings/language.');
            router.replace('/settings/language');
        }
      } else {
        console.log('[ProfileProvider] Profile document NOT found for new user.');
        setUserProfile(null);
        
        // If the user is authenticated but has no profile,
        // they MUST be sent to the signup page to create one.
        if (pathname !== '/signup') {
            console.log('[ProfileProvider] New user is not on signup page. Redirecting to /signup.');
            router.replace('/signup');
        }
      }
      setIsProfileLoading(false);
    };

    checkUserProfile();
  }, [user, pathname, router, searchParams, toast]);

  return (
    <ProfileContext.Provider value={{ userProfile, isProfileLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ProfileProviderLogic>{children}</ProfileProviderLogic>
    </Suspense>
  );
}

export const useProfile = () => useContext(ProfileContext);
