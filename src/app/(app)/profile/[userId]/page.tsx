// src/app/(app)/profile/[userId]/page.tsx
'use client';

import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db, doc, getDoc, collection, query, where, getDocs, orderBy } from '@/lib/firebase'; // Add orderBy
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { User, Post } from '@/types';
import { useSidebarContext } from '@/contexts/SidebarContext';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { authUserId } = useSidebarContext();

  const [viewedUser, setViewedUser] = useState<User | null | 'not-found'>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for the auth context to provide the current user's ID.
    // The main layout's loader should cover this, but this is a fallback.
    if (!authUserId) {
        setIsLoading(false); // Stop loading if auth state is not resolved yet
        return;
    }

    const fetchProfileData = async () => {
      if (!userId) {
        setViewedUser('not-found');
        return;
      }
      if (!db) {
        setError("Database not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const fetchedData = { id: userId, ...userDocSnap.data() } as User;

          // Fetch real posts from Firestore, ordered by creation date
          const postsCollectionRef = collection(db, 'posts');
          const userPostsQuery = query(postsCollectionRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
          const postsSnapshot = await getDocs(userPostsQuery);

          const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
          
          setUserPosts(posts);
          setViewedUser({ ...fetchedData, postCount: posts.length });
        } else {
          setViewedUser('not-found');
        }
      } catch (e: any) {
        console.error("Error fetching profile:", e);
        let detailedError = "Could not load profile data. Please try again later.";
        if (e.code === 'permission-denied') {
          detailedError = "Permission Denied: Your security rules are blocking access to your profile data.";
        } else if (e.code === 'failed-precondition' && e.message.includes('index')) {
          detailedError = "Database Index Missing: A required Firestore index is missing. Please check the browser console for a link to create it.";
        } else if (e.message) {
          detailedError = `An unexpected error occurred: ${e.message}`;
        }
        setError(detailedError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();

    // Also check if the viewed profile is the current user's profile
    setIsCurrentUserProfile(authUserId === userId);

  }, [userId, authUserId]); // Depend on both the viewed user ID and the authenticated user ID

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
        <p className="mt-4 text-lg font-semibold">Error Loading Profile</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!viewedUser) {
    // This state can be reached if authUserId is not yet available.
    // The parent layout's loader should cover this, but this is a fallback.
    return (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
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
