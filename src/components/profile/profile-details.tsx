
// src/components/profile/profile-details.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import { MapPin, Leaf, UserPlus, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

interface ProfileDetailsProps {
  user: User;
  isCurrentUser?: boolean;
}

export function ProfileDetails({ user, isCurrentUser = false }: ProfileDetailsProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarInitial = (user.name || user.username)?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <div className="w-full shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-green-400/30 to-accent/30" data-ai-hint="farm nature simple">
          {/* Cover Photo area - can be an actual image later */}
        </div>

        <div className="relative px-4 sm:px-6 pb-6">
          <div className="flex flex-col items-center -mt-16 sm:-mt-20">
            <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-transform hover:scale-105"
                  aria-label="View profile picture"
                >
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-lg cursor-pointer bg-muted">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/128x128.png?text=${avatarInitial}`} alt={user.name || user.username} data-ai-hint="person farmer" />
                    <AvatarFallback className="text-4xl sm:text-5xl">{avatarInitial}</AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              {user.avatarUrl ? (
                <DialogOverlay className="bg-black/70 backdrop-blur-sm fixed inset-0 z-[51]" />
              ) : null}
              <DialogContent className="p-0 max-w-md w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[52]">
                 <DialogHeader className="sr-only">
                    <DialogTitle>Enlarged Profile Picture of {user.name || user.username}</DialogTitle>
                  </DialogHeader>
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

            <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-foreground">{user.name || user.username}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>

          {user.bio && <p className="text-center text-foreground/90 leading-relaxed mt-4 text-sm sm:text-base">{user.bio}</p>}
          
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground mt-4">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                {user.location}
              </div>
            )}
            {user.produce && user.produce.length > 0 && (
              <div className="flex items-center">
                <Leaf className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <span>Grows: {user.produce.join(', ')}</span>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-around items-center text-center">
              <div className="flex flex-col items-center">
                <p className="text-lg sm:text-xl font-semibold text-foreground">{user.postCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="flex flex-col items-center">
                  <p className="text-lg sm:text-xl font-semibold text-foreground">{user.followersCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Link href={`/profile/${user.id}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
                <p className="text-lg sm:text-xl font-semibold text-foreground">{user.followingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </Link>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            {isCurrentUser ? (
              <Button asChild variant="outline" size="sm"> 
                <Link href="/settings/account">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            ) : (
              <>
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/messages/${user.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
    