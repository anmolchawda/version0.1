// src/components/profile/profile-details.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { User } from '@/types';
import { MapPin, Leaf, UserPlus, MessageSquare, Settings, Edit3 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface ProfileDetailsProps {
  user: User;
  isCurrentUser?: boolean;
}

export function ProfileDetails({ user, isCurrentUser = false }: ProfileDetailsProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarInitial = (user.name || user.username)?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <Card className="w-full shadow-lg rounded-xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-primary via-green-400 to-accent" data-ai-hint="farm nature">
          {/* Optional: Cover Photo */}
        </div>
        <CardHeader className="flex flex-col items-center text-center -mt-16">
          <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-transform hover:scale-105"
                aria-label="View profile picture"
              >
                <Avatar className="h-28 w-28 border-4 border-background shadow-md cursor-pointer">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${avatarInitial}`} alt={user.name || user.username} data-ai-hint="person farmer" />
                  <AvatarFallback className="text-4xl">{avatarInitial}</AvatarFallback>
                </Avatar>
              </button>
            </DialogTrigger>
            {user.avatarUrl && (
            <DialogOverlay className="bg-black/70 backdrop-blur-sm fixed inset-0 z-50" />
            )}
            <DialogContent className="p-0 max-w-md w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[51]">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.name || user.username}'s profile picture`}
                  width={400}
                  height={400}
                  className="rounded-lg object-contain max-h-[80vh] max-w-[80vw]"
                  data-ai-hint="person farmer large"
                />
              ) : (
                <div className="h-64 w-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-4xl">
                  {avatarInitial}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <h1 className="text-2xl font-bold mt-4">{user.name || user.username}</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </CardHeader>
        <CardContent className="text-center space-y-4 px-6 pb-6">
          {user.bio && <p className="text-foreground leading-relaxed">{user.bio}</p>}
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                {user.location}
              </div>
            )}
            {user.produce && user.produce.length > 0 && (
              <div className="flex items-center">
                <Leaf className="h-4 w-4 mr-1.5 text-primary" />
                Specializes in: {user.produce.join(', ')}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 pt-2">
              <div className="text-center">
                <p className="font-bold text-lg">{user.postCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                  <p className="font-bold text-lg">{user.followersCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Link href={`/profile/${user.id}/following`} className="text-center hover:opacity-80 transition-opacity">
                <p className="font-bold text-lg">{user.followingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </Link>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            {isCurrentUser ? (
              <Button asChild variant="outline"> 
                <Link href="/settings/account">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            ) : (
              <>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/messages/${user.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>

         {/* The Edit3 (PenLine-like) icon button that was here has been removed */}
      </Card>
    </>
  );
}
