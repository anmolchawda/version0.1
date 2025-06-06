// src/app/(app)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, db, doc, getDoc } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderPostsForUser } from '@/lib/placeholders'; // Posts still from placeholders
import type { User } from '@/types';
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
        // Fetch profile data from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setProfileData({ id: user.uid, ...userDocSnap.data() } as User);
          } else {
            // Fallback if Firestore document doesn't exist
            setProfileData({
              id: user.uid,
              username: user.email?.split('@')[0] || 'user',
              name: user.displayName || user.email?.split('@')[0] || 'User',
              avatarUrl: user.photoURL || undefined,
              bio: 'Welcome to your profile! Consider editing it to share more about yourself.',
              followersCount: 0,
              followingCount: 0,
              postCount: 0, // Will be updated by placeholder posts length below
            });
          }
          // Posts are still from placeholders for this user
          const placeholderPosts = getPlaceholderPostsForUser(user.uid);
          setUserPosts(placeholderPosts);
          // Update postCount in profileData if it was a fallback
          setProfileData(prev => ({ ...prev!, postCount: placeholderPosts.length }));

        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback in case of error
           setProfileData({
              id: user.uid,
              username: user.email?.split('@')[0] || 'user',
              name: user.displayName || user.email?.split('@')[0] || 'User',
              avatarUrl: user.photoURL || undefined,
              bio: 'Error loading profile details.',
              followersCount: 0,
              followingCount: 0,
              postCount: 0,
            });
        }
      } else {
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

  if (!firebaseUser || !profileData) {
    // This state might be briefly hit or if something goes wrong with auth/data fetching
    // Or if redirect to /login is in progress
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
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
