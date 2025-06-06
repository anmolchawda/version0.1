// src/app/(app)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, db, doc, getDoc } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser } from '@/lib/placeholders';
import type { User, Post } from '@/types';
import { useRouter } from 'next/navigation';

export default function MyProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const placeholderPosts = getPlaceholderPostsForUser(user.uid);
          setUserPosts(placeholderPosts); // Set posts regardless of profile source

          if (userDocSnap.exists()) {
            const fetchedData = { id: user.uid, ...userDocSnap.data() } as User;
            setProfileData({ ...fetchedData, postCount: placeholderPosts.length });
          } else {
            // Fallback if Firestore document doesn't exist for the logged-in user
            console.warn(`Firestore document for user ${user.uid} not found. Using fallback profile data.`);
            setProfileData({
              id: user.uid,
              username: user.email?.split('@')[0] || 'new_user',
              name: user.displayName || user.email?.split('@')[0] || 'New User',
              avatarUrl: user.photoURL || undefined,
              bio: 'Welcome to your profile! Please edit it to share more about yourself.',
              followersCount: 0,
              followingCount: 0,
              postCount: placeholderPosts.length,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          const placeholderPosts = getPlaceholderPostsForUser(user.uid); // Ensure posts are set even on error
          setUserPosts(placeholderPosts);
          setProfileData({ // Fallback in case of Firestore error
            id: user.uid,
            username: user.email?.split('@')[0] || 'error_user',
            name: user.displayName || 'Error Loading Profile',
            avatarUrl: user.photoURL || undefined,
            bio: 'There was an issue loading your profile details.',
            followersCount: 0,
            followingCount: 0,
            postCount: placeholderPosts.length,
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user is logged in, redirect to login page
        router.push('/login');
        // No need to setIsLoading(false) here as the component will unmount or redirect.
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    // This state implies the user is logged out and redirection should occur.
    // Display a minimal loading/redirecting message.
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (!profileData) {
    // This state means user is logged in, but profileData couldn't be set (e.g., Firestore error not caught above or unexpected state)
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="mt-4 text-lg">Could not load profile data.</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  // ProfileData should be available here
  return (
    <div className="space-y-8">
      <ProfileDetails user={profileData} isCurrentUser={true} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
