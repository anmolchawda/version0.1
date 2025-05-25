
// src/app/(app)/profile/[userId]/following/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderUser, placeholderUsers } from '@/lib/placeholders';
import type { User } from '@/types';
import { ChevronLeft, Users, ListChecks, ChevronRight } from 'lucide-react';

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const user = getPlaceholderUser(userId);
      setProfileUser(user || null);

      // Mock fetching of following list
      let followed: User[] = [];
      if (user) {
        if (user.id === '1') { // FarmerJohn
          followed = [
            placeholderUsers.find(u => u.id === '2'),
            placeholderUsers.find(u => u.id === '3'),
          ].filter((u): u is User => u !== undefined);
        } else if (user.id === '2') { // GreenThumbSarah
          followed = [
            placeholderUsers.find(u => u.id === '1'),
          ].filter((u): u is User => u !== undefined);
        }
        // Other users follow no one in this mock
      }
      setFollowingList(followed);
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <ListChecks className="h-8 w-8 animate-pulse text-primary" />
        <p className="ml-2 text-muted-foreground">Loading following list...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="relative flex flex-row items-center pt-4 pb-4 pr-4 pl-2 sm:pl-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 mr-2"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex items-center flex-grow">
            <Users className="mr-2 h-6 w-6 sm:mr-3 sm:h-7 sm:w-7" />
            Following
          </CardTitle>
          <div className="h-9 w-9 ml-2 hidden sm:block"></div> {/* Spacer */}
        </CardHeader>
        <CardContent className="pt-0"> {/* Changed pt-6 to pt-0 */}
          {followingList.length > 0 ? (
            <div className="divide-y divide-border">
              {followingList.map((followedUser) => (
                <Link
                  key={followedUser.id}
                  href={`/profile/${followedUser.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={followedUser.avatarUrl || `https://placehold.co/40x40.png?text=${followedUser.username.charAt(0)}`} alt={followedUser.username} data-ai-hint="person user"/>
                      <AvatarFallback>{(followedUser.name || followedUser.username)?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {followedUser.name || followedUser.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{followedUser.username}
                      </p>
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
