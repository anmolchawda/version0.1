
// src/components/profile/profile-details.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import { MapPin, Leaf, Settings, UserPlus, MessageSquare } from 'lucide-react';
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
      <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden p-4 sm:p-6">
        {/* Top Section: Avatar and Stats */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4">
          {/* Avatar */}
          <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-transform hover:scale-105 flex-shrink-0"
                aria-label="View profile picture"
              >
                <Avatar className="h-20 w-20 sm:h-24 md:h-28 md:w-28 border-2 border-primary shadow-md bg-muted">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/112x112.png?text=${avatarInitial}`} alt={user.name || user.username} data-ai-hint="person farmer" />
                  <AvatarFallback className="text-3xl sm:text-4xl">{avatarInitial}</AvatarFallback>
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

          {/* Stats and Username/Actions for larger screens */}
          <div className="flex flex-col items-center sm:items-start sm:flex-1 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground hidden sm:block">{user.username}</h2>
             {/* Action Buttons for larger screens - moved here for typical Insta layout */}
            <div className="hidden sm:flex mt-2 mb-3 space-x-2">
              {isCurrentUser ? (
                <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Link href="/settings/account">
                    <Settings className="mr-1.5 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 sm:flex-none">
                    <UserPlus className="mr-1.5 h-4 w-4" /> Follow
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                     <Link href={`/messages/${user.id}`}>
                      <MessageSquare className="mr-1.5 h-4 w-4" /> Message
                    </Link>
                  </Button>
                </>
              )}
            </div>
            <div className="flex justify-around items-center text-center w-full border-t sm:border-none pt-3 sm:pt-0 mt-3 sm:mt-0">
              <div className="flex flex-col items-center px-2">
                <p className="text-md sm:text-lg font-semibold text-foreground">{user.postCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <p className="text-md sm:text-lg font-semibold text-foreground">{user.followersCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Link href={`/profile/${user.id}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity px-2">
                <p className="text-md sm:text-lg font-semibold text-foreground">{user.followingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Name, Bio, and other info */}
        <div className="text-center sm:text-left">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">{user.name || user.username}</h1>
          <p className="text-sm text-muted-foreground sm:hidden mb-2">@{user.username}</p> {/* Username for mobile if name is shown above */}
          
          {user.bio && <p className="text-foreground/90 leading-relaxed mt-1 text-sm">{user.bio}</p>}
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                {user.location}
              </div>
            )}
            {user.produce && user.produce.length > 0 && (
              <div className="flex items-center">
                <Leaf className="h-3.5 w-3.5 mr-1 text-primary" />
                <span>Grows: {user.produce.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for smaller screens - below info */}
        <div className="mt-4 flex sm:hidden gap-2">
          {isCurrentUser ? (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/settings/account">
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          ) : (
            <>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1">
                <UserPlus className="mr-2 h-4 w-4" /> Follow
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/messages/${user.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
