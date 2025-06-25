// src/app/(app)/my-profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, doc, getDoc } from '@/lib/firebase';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser } from '@/lib/placeholders';
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
    const fetchProfileData = async () => {
      if (!authUserId) {
        setIsLoading(false);
        // This case should be handled by the layout redirecting to login,
        // but we'll add a check here as a safeguard.
        setError("You must be logged in to view your profile.");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      // Use Firestore to get the user's profile data
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
          // Use placeholder posts for now
          const postsForUser = getPlaceholderPostsForUser(authUserId);
          setUserPosts(postsForUser);
          setProfileData({ ...fetchedData, postCount: postsForUser.length });
        } else {
          // This case should be handled by the main layout redirecting to /setup-profile
          // If we get here, it's an inconsistent state.
          console.warn(`Firestore document for user ${authUserId} not found. Redirecting to profile setup.`);
          router.replace('/setup-profile');
          return; // Stop further execution
        }
      } catch (e) {
        console.error("Error fetching user profile from Firestore:", e);
        setError("Could not load profile data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authUserId, router]);

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
        <p className="mt-4 text-lg">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    // This state should ideally not be reached if the logic above is correct
    // (either loading, error, or redirected).
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
