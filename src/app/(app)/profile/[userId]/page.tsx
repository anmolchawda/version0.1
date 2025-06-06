// src/app/(app)/profile/[userId]/page.tsx
'use client';

import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser } from '@/lib/placeholders'; // Posts still from placeholders
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
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const fetchedData = { id: userId, ...userDocSnap.data() } as User;
           // Posts are still from placeholders for this user
          const placeholderPosts = getPlaceholderPostsForUser(userId);
          setUserPosts(placeholderPosts);
          // Update postCount in fetchedData if it exists
          setViewedUser({ ...fetchedData, postCount: placeholderPosts.length });
        } else {
          setViewedUser('not-found');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setViewedUser('not-found'); // Treat error as not found
      }

      const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
        setIsCurrentUserProfile(firebaseUser ? userId === firebaseUser.uid : false);
        setIsLoading(false);
      });
      return () => unsubscribeAuth(); // Cleanup auth listener
    };

    if (userId) {
      fetchProfileData();
    } else {
      setViewedUser('not-found'); // No userId, definitely not found
      setIsLoading(false);
    }
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
    // It's better to call notFound() during render for Next.js to handle it properly
    notFound(); 
    return null; // Should not be reached if notFound() works as expected
  }
  
  if (!viewedUser) { // Should be caught by 'not-found' or loader, but as a fallback
      return (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="mt-4 text-lg">Profile could not be loaded.</p>
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
