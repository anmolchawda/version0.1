// src/app/(app)/my-profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
// Import 'auth' from our firebase.ts, which will be null in mock mode
import { auth, db, doc, getDoc } from '@/lib/firebase'; 
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser, getPlaceholderUser, MOCK_USER_ID } from '@/lib/placeholders';
import type { User, Post } from '@/types';
import { useRouter } from 'next/navigation';

// Determine if mock data should be used based on whether 'auth' is null
const COMPONENT_USE_MOCK_DATA = auth === null;

export default function MyProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); 
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe = () => {}; // Default to no-op

    if (COMPONENT_USE_MOCK_DATA) {
      console.log("[MyProfilePage] Using MOCK_DATA mode.");
      const mockProfile = getPlaceholderUser(MOCK_USER_ID);
      if (mockProfile) {
        const mockFbUser: FirebaseUser = { // Simulate FirebaseUser structure
          uid: mockProfile.id,
          email: mockProfile.email || `${mockProfile.username}@example.com`,
          displayName: mockProfile.name || mockProfile.username,
          photoURL: mockProfile.avatarUrl || null,
          emailVerified: true, isAnonymous: false, metadata: {}, providerData: [], providerId: 'mock',
          refreshToken: '', tenantId: null, delete: async () => {}, getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({}),
        };
        setFirebaseUser(mockFbUser);
        const posts = getPlaceholderPostsForUser(MOCK_USER_ID);
        setUserPosts(posts);
        setProfileData({ ...mockProfile, postCount: posts.length });
      } else {
        console.error(`[MyProfilePage] Mock user with ID ${MOCK_USER_ID} not found.`);
        setProfileData(null); // Ensure profileData is null if mock user isn't found
      }
      setIsLoading(false);
    } else if (auth && db) { // Ensure auth and db are not null for real Firebase mode
      console.log("[MyProfilePage] Using REAL Firebase Auth mode.");
      unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setFirebaseUser(user);
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            // Continue using placeholder posts even in real auth mode for now, as per overall strategy
            const postsForUser = getPlaceholderPostsForUser(user.uid);
            setUserPosts(postsForUser);

            if (userDocSnap.exists()) {
              const fetchedData = { id: user.uid, ...userDocSnap.data() } as User;
              setProfileData({ ...fetchedData, postCount: postsForUser.length });
            } else {
              console.warn(`Firestore document for user ${user.uid} not found. Using fallback profile data.`);
              setProfileData({
                id: user.uid,
                username: user.email?.split('@')[0] || 'new_user',
                name: user.displayName || user.email?.split('@')[0] || 'New User',
                avatarUrl: user.photoURL || undefined,
                bio: 'Welcome to your profile! Please edit it to share more about yourself.',
                followersCount: 0,
                followingCount: 0,
                postCount: postsForUser.length,
              });
            }
          } catch (error) {
            console.error("Error fetching user profile from Firestore:", error);
            const postsForUserOnError = getPlaceholderPostsForUser(user.uid);
            setUserPosts(postsForUserOnError);
            setProfileData({
              id: user.uid,
              username: user.email?.split('@')[0] || 'error_user',
              name: user.displayName || 'Error Loading Profile',
              avatarUrl: user.photoURL || undefined,
              bio: 'There was an issue loading your profile details.',
              followersCount: 0,
              followingCount: 0,
              postCount: postsForUserOnError.length,
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          router.push('/login');
        }
      });
    } else {
      // This case implies auth or db is null but not in explicit mock mode,
      // which shouldn't happen if firebase.ts is consistent.
      // Or if we are not in mock mode, but firebase failed to initialize.
      console.error("[MyProfilePage] Firebase auth or db instance is null, but not in explicit mock mode. This is unexpected.");
      setIsLoading(false);
      router.push('/login'); // Fallback to login
    }

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  // If in real mode and firebaseUser (from auth state) is not set, means user is logged out.
  if (!COMPONENT_USE_MOCK_DATA && !firebaseUser) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // If profileData is null after loading (either mock user not found or real fetch failed)
  if (!profileData) {
     const errorMessage = COMPONENT_USE_MOCK_DATA 
       ? `Mock profile data not found for User ID: ${MOCK_USER_ID}. Check placeholders.ts.`
       : "Could not load profile data. Please try refreshing the page or check logs.";
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive p-4">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="mt-4 text-lg text-center">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* isCurrentUser is true because this is the MyProfilePage */}
      <ProfileDetails user={profileData} isCurrentUser={true} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
