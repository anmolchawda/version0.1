'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Define the shape of a user profile document from your Firestore
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  // Add any other fields you expect to find
}

interface ProfileContextType {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  isNewUser: boolean; // <-- NEW state to track if profile exists
}

const ProfileContext = createContext<ProfileContextType>({
  userProfile: null,
  isProfileLoading: true,
  isNewUser: false, // Default to false
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false); // <-- NEW state

  useEffect(() => {
    const checkUserProfile = async () => {
      // Don't do anything if auth is loading or there is no authenticated user.
      if (isAuthLoading || !user) {
        if (!isAuthLoading) {
          // If auth is done and still no user, reset all states
          setUserProfile(null);
          setIsNewUser(false);
          setIsProfileLoading(false);
        }
        return;
      }

      console.log(`[ProfileProvider] Auth user found (${user.uid}). Checking for profile document...`);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // ▼▼▼ USER PROFILE FOUND ▼▼▼
        console.log('[ProfileProvider] Profile document exists. Loading profile.');
        const profileData = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
        setUserProfile(profileData);
        setIsNewUser(false); // This is an existing user
      } else {
        // ▼▼▼ USER PROFILE NOT FOUND ▼▼▼
        console.log('[ProfileProvider] Profile document does NOT exist. Marking as new user.');
        setUserProfile(null); // No profile data to set
        setIsNewUser(true); // This is a new user who needs to sign up
      }
      setIsProfileLoading(false);
    };

    checkUserProfile();
  }, [user, isAuthLoading]); // Re-run this check whenever the user object changes

  // --- NEW: Effect to handle redirecting new users ---
  useEffect(() => {
    // Wait until loading is complete before doing any redirects
    if (isProfileLoading || isAuthLoading) {
      return;
    }

    // If this is a new user and they are NOT on the signup page, redirect them.
    if (isNewUser && pathname !== '/signup') {
      console.log('[ProfileProvider] New user detected. Redirecting to /signup page.');
      router.replace('/signup');
    }
  }, [isNewUser, isProfileLoading, isAuthLoading, pathname, router]);

  return (
    <ProfileContext.Provider value={{ userProfile, isProfileLoading, isNewUser }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook to easily access the profile context
export const useProfile = () => useContext(ProfileContext);
