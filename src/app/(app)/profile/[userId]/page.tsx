// src/app/(app)/profile/[userId]/page.tsx
'use client';

import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db, doc, getDoc, collection, query, where, getDocs } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { User, Post } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [viewedUser, setViewedUser] = useState<User | null | 'not-found'>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      if (!userId) {
        if (isMounted) setViewedUser('not-found');
        return;
      }
      if (!db) {
        if (isMounted) setError("Database not available.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        if (userDocSnap.exists()) {
          const fetchedData = { id: userId, ...userDocSnap.data() } as User;

          // Fetch real posts from Firestore
          const postsCollectionRef = collection(db, 'posts');
          const userPostsQuery = query(postsCollectionRef, where('userId', '==', userId));
          const postsSnapshot = await getDocs(userPostsQuery);

          if (!isMounted) return;
          const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
          
          setUserPosts(posts);
          setViewedUser({ ...fetchedData, postCount: posts.length });
        } else {
          setViewedUser('not-found');
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
        if (isMounted) setError("Could not load profile data. Please try again later.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfileData();

    const unsubscribeAuth = auth!.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (isMounted) {
        setIsCurrentUserProfile(firebaseUser ? userId === firebaseUser.uid : false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (viewedUser === 'not-found') {
    notFound();
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive p-4 text-center">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="mt-4 text-lg">{error}</p>
      </div>
    );
  }

  if (!viewedUser) {
    // This case is unlikely if the logic above is correct, but acts as a safeguard.
    return (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-destructive p-4 text-center">
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
