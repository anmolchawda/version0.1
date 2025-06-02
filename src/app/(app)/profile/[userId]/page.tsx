// src/app/(app)/profile/[userId]/page.tsx
'use client';

import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderUser, getPlaceholderPostsForUser } from '@/lib/placeholders';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function UserProfilePage({ params: { userId } }: { params: { userId: string } }) {
  const user = getPlaceholderUser(userId); // User being viewed

  const [isCurrentUser, setIsCurrentUser] = useState<boolean | undefined>(undefined); // undefined for loading state
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setIsCurrentUser(userId === firebaseUser.uid);
      } else {
        // This case should ideally be handled by the main app layout's redirect
        // If an unauthenticated user somehow reaches here, treat as not current user.
        setIsCurrentUser(false);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [userId]);

  if (!user) {
    // If placeholder user data itself is not found for the given userId
    notFound();
  }

  // Fetch placeholder posts for the user
  const userPosts = getPlaceholderPostsForUser(userId);

  if (isLoadingAuth || isCurrentUser === undefined) {
    // Show loader while authentication state is being determined
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileDetails user={user} isCurrentUser={isCurrentUser} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
