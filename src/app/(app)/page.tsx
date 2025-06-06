// src/app/(app)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderUser, getPlaceholderPostsForUser } from '@/lib/placeholders';
import type { User, Post } from '@/types';
import { useRouter } from 'next/navigation';

export default function MyProfilePage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        const placeholderProfile = getPlaceholderUser(user.uid);
        const placeholderPosts = getPlaceholderPostsForUser(user.uid);
        
        if (placeholderProfile) {
          setProfileData(placeholderProfile);
        } else {
          // Fallback if placeholder for UID doesn't exist, create a basic one
          setProfileData({
            id: user.uid,
            username: user.email?.split('@')[0] || 'user',
            name: user.displayName || user.email?.split('@')[0] || 'User',
            avatarUrl: user.photoURL || undefined,
            bio: 'Welcome to your profile!',
            followersCount: 0,
            followingCount: 0,
            postCount: placeholderPosts.length,
          });
        }
        setUserPosts(placeholderPosts);
      } else {
        // This case should ideally be handled by the main app layout's redirect
        router.push('/login');
      }
      setIsLoading(false);
    });

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

  if (!currentUser || !profileData) {
    // This state might be briefly hit or if something goes wrong with auth/placeholder data
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <p className="mt-4 text-muted-foreground">Could not load profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileDetails user={profileData} isCurrentUser={true} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
