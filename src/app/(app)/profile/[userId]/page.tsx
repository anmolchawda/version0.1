// src/app/(app)/profile/[userId]/page.tsx
'use client';

import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser } from '@/lib/placeholders';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db, doc, getDoc } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { User, Post } from '@/types';

export default function UserProfilePage({ params: { userId } }: { params: { userId: string } }) {
  const [viewedUser, setViewedUser] = useState<User | null | 'not-found'>(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchProfileData = async () => {
      if (!userId) {
        if (isMounted) {
          setViewedUser('not-found');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        if (userDocSnap.exists()) {
          const fetchedData = { id: userId, ...userDocSnap.data() } as User;
          const placeholderPosts = getPlaceholderPostsForUser(userId);
          setUserPosts(placeholderPosts);
          setViewedUser({ ...fetchedData, postCount: placeholderPosts.length });
        } else {
          setViewedUser('not-found');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (isMounted) {
          setViewedUser('not-found');
        }
      } finally {
        // The auth check will set isLoading to false
      }
    };

    fetchProfileData();

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (isMounted) {
        setIsCurrentUserProfile(firebaseUser ? userId === firebaseUser.uid : false);
        setIsLoading(false); // Final loading state set after auth check
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [userId]);

  if (isLoading || isCurrentUserProfile === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (viewedUser === 'not-found') {
    notFound(); // Trigger Next.js 404 page
  }
  
  if (!viewedUser) {
    // This case handles errors or unexpected states not leading to 'not-found'
    // but where viewedUser is still null after loading.
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="mt-4 text-lg">Profile could not be loaded.</p>
        <p className="text-sm text-muted-foreground">Please check the URL or try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileDetails user={viewedUser} isCurrentUser={isCurrentUserProfile} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
