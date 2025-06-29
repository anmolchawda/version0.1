// src/app/(app)/my-profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, doc, getDoc, collection, query, where, getDocs, orderBy } from '@/lib/firebase'; // Import orderBy
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import type { User, Post } from '@/types';
import { useSidebarContext } from '@/contexts/SidebarContext';

export default function MyProfilePage() {
  const router = useRouter();
  const { authUserId } = useSidebarContext();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't start fetching until we know who the user is.
    // The parent layout handles the loading state before authUserId is available.
    if (!authUserId) {
      setIsLoading(false); // Stop loading if authId disappears for any reason
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!db) {
        setError("Database connection is not available.");
        setIsLoading(false);
        return;
      }
      
      try {
        const userDocRef = doc(db, 'users', authUserId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const fetchedData = { id: authUserId, ...userDocSnap.data() } as User;

          // Fetch user's actual posts from Firestore, ordered by creation date
          const postsCollectionRef = collection(db, 'posts');
          const userPostsQuery = query(postsCollectionRef, where('userId', '==', authUserId), orderBy('createdAt', 'desc'));
          const userPostsSnapshot = await getDocs(userPostsQuery);

          const postsForUser: Post[] = userPostsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Post[];
          setUserPosts(postsForUser);

          setProfileData({ ...fetchedData, postCount: postsForUser.length });
        } else {
          // This case is handled by the main layout redirecting to /settings/account
          // If we somehow get here, it's an inconsistent state.
          console.error(`User document for ${authUserId} not found, but layout guard passed.`);
          setError("Your profile data could not be found.");
        }
      } catch (e: any) {
        console.error("Error fetching user profile from Firestore:", e);
        let detailedError = "Could not load profile data. Please try refreshing the page.";
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
  }, [authUserId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
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

  if (!profileData) {
    // This can happen briefly while authUserId is resolved or if the user truly doesn't exist.
    // The layout guard should prevent non-existent users from reaching here, but this is a fallback.
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your profile...</p>
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
