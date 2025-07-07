// src/app/(app)/profile/[userId]/following/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/types';
import { ChevronLeft, Users, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setError("User ID not found or database not available.");
      setIsLoading(false);
      return;
    }

    const fetchFollowingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          throw new Error("Profile user not found.");
        }
        const user = { id: userDocSnap.id, ...userDocSnap.data() } as User;
        setProfileUser(user);

        const followingRef = collection(db, 'users', userId, 'following');
        const q = query(followingRef);
        const querySnapshot = await getDocs(q);
        const followingIds = querySnapshot.docs.map(d => d.id);
        
        if (followingIds.length > 0) {
          const followedUsersPromises = followingIds.map(id => getDoc(doc(db, 'users', id)));
          const followedUsersDocs = await Promise.all(followedUsersPromises);
          
          const followedUsersList = followedUsersDocs
            .filter(d => d.exists())
            .map(d => ({ id: d.id, ...d.data() } as User));
            
          setFollowingList(followedUsersList);
        } else {
          setFollowingList([]);
        }
      } catch (e) {
        console.error("Error fetching following list:", e);
        setError("Could not load the list of users being followed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowingData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      );
  }

  if (!profileUser) {
    return <div className="flex items-center justify-center py-10 text-muted-foreground">Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="relative flex flex-row items-center pt-4 pb-4 pr-4 pl-2 sm:pl-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 mr-2" aria-label="Go back">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex items-center flex-grow">
            <Users className="mr-2 h-6 w-6 sm:mr-3 sm:h-7 sm:w-7" />
            Following
          </CardTitle>
          <div className="h-9 w-9 ml-2 hidden sm:block"></div>
        </CardHeader>
        <CardContent className="p-0">
          {followingList.length > 0 ? (
            <div className="divide-y divide-border">
              {followingList.map((followedUser) => (
                <Link key={followedUser.id} href={`/profile/${followedUser.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={followedUser.avatarUrl || `https://placehold.co/40x40.png?text=${followedUser.username.charAt(0)}`} alt={followedUser.username} data-ai-hint="person user"/>
                      <AvatarFallback>{(followedUser.name || followedUser.username)?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{followedUser.name || followedUser.username}</p>
                      <p className="text-xs text-muted-foreground">@{followedUser.username}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground px-4">
              <Users className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">@{profileUser.username} isn't following anyone yet.</p>
              <p className="text-sm">When they follow people, they'll appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
