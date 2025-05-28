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
      <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden relative">
        {isCurrentUser && (
          <Link href="/settings/account" className="absolute top-3 right-3 z-10">
            <Button variant="ghost" size="icon" aria-label="Edit Profile" className="h-8 w-8">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        )}
        
        <div className="p-4 sm:p-6">
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
                  <Avatar className="h-20 w-20 sm:h-24 border-2 border-primary shadow-md bg-muted">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/96x96.png?text=${avatarInitial}`} alt={user.name || user.username} data-ai-hint="person farmer" />
                    <AvatarFallback className="text-3xl sm:text-4xl">{avatarInitial}</AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              {user.avatarUrl ? (
                <DialogOverlay className="bg-black/70 backdrop-blur-sm fixed inset-0 z-[51]" />
              ) : null}
              <DialogContent className="p-0 max-w-md w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[52]">
                <DialogHeader className="sr-only">
                  <DialogTitle className="sr-only">Enlarged Profile Picture of {user.name || user.username}</DialogTitle>
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

            {/* Stats for all screens */}
            <div className="flex flex-1 justify-around items-center text-center w-full sm:w-auto sm:pt-2">
              <div className="px-2">
                <p className="text-lg font-semibold text-foreground">{user.postCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="px-2">
                <p className="text-lg font-semibold text-foreground">{user.followersCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Link href={`/profile/${user.id}/following`} className="hover:opacity-80 transition-opacity px-2">
                <p className="text-lg font-semibold text-foreground">{user.followingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </Link>
            </div>
          </div>

          {/* Info Section */}
          <div className="text-left space-y-1">
            <h1 className="text-lg font-semibold text-foreground">{user.name || user.username}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            
            {user.bio && <p className="text-sm text-foreground/90 leading-relaxed pt-1">{user.bio}</p>}
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start justify-start gap-x-4 gap-y-1.5 text-sm text-muted-foreground pt-2">
              {user.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                  {user.location}
                </div>
              )}
              {user.produce && user.produce.length > 0 && (
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1.5 text-primary" />
                  <span>Specializes in: {user.produce.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons Section */}
        {!isCurrentUser && (
          <div className="p-4 sm:p-6 border-t">
            <div className="flex gap-2">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1">
                    <UserPlus className="mr-1.5 h-4 w-4" /> Follow
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/messages/${user.id}`}>
                    <MessageSquare className="mr-1.5 h-4 w-4" /> Message
                    </Link>
                </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
