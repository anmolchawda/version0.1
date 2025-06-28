
// src/components/profile/profile-details.tsx
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import { MapPin, Leaf, Settings, UserPlus, MessageSquare, Store, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogOverlay, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ProfileDetailsProps {
  user: User;
  isCurrentUser?: boolean;
}

function ProfileDetailsComponent({ user, isCurrentUser = false }: ProfileDetailsProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);
  const [localFollowersCount, setLocalFollowersCount] = useState(user.followersCount ?? 0);

  const avatarInitial = (user.name || user.username)?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (isCurrentUser || !authUserId || !db) {
      setFollowLoading(false);
      return;
    }
    const checkFollowStatus = async () => {
      setFollowLoading(true);
 if (!db) {
 setFollowLoading(false);
 return;
 }
      const followDocRef = doc(db, 'users', authUserId, 'following', user.id);
      try {
        const docSnap = await getDoc(followDocRef);
        setIsFollowing(docSnap.exists());
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setFollowLoading(false);
      }
    };
    checkFollowStatus();
    setLocalFollowersCount(user.followersCount ?? 0);
  }, [authUserId, user.id, isCurrentUser, user.followersCount]);

  const handleToggleFollow = async () => {
 if (!db || !authUserId || followLoading) {
 setFollowLoading(false);
 return;
 }

    setFollowLoading(true);

    const newFollowState = !isFollowing;
    const currentUserFollowingRef = doc(db, 'users', authUserId, 'following', user.id);
    const viewedUserFollowersRef = doc(db, 'users', user.id, 'followers', authUserId);
    const currentUserDocRef = doc(db, 'users', authUserId);
    const viewedUserDocRef = doc(db, 'users', user.id);
    
    // Optimistic UI Update
    setIsFollowing(newFollowState);
    setLocalFollowersCount(prev => newFollowState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const batch = writeBatch(db);
      if (newFollowState) { // Follow
        batch.set(currentUserFollowingRef, { followedAt: serverTimestamp() });
        batch.set(viewedUserFollowersRef, { followedAt: serverTimestamp() });
        batch.update(currentUserDocRef, { followingCount: increment(1) });
        batch.update(viewedUserDocRef, { followersCount: increment(1) });
      } else { // Unfollow
        batch.delete(currentUserFollowingRef);
        batch.delete(viewedUserFollowersRef);
        batch.update(currentUserDocRef, { followingCount: increment(-1) });
        batch.update(viewedUserDocRef, { followersCount: increment(-1) });
      }
      await batch.commit();
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({ title: "Error", description: "Could not update follow status. Please try again.", variant: "destructive" });
      // Revert optimistic updates
      setIsFollowing(!newFollowState);
      setLocalFollowersCount(user.followersCount ?? 0);
    } finally {
      setFollowLoading(false);
    }
  };

  const followButtonText = isFollowing ? 'Following' : 'Follow';
  const FollowIcon = isFollowing ? Check : UserPlus;

  return (
    <>
      <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden relative">
        {isCurrentUser && (
          <Link href="/settings/account" className="absolute top-3 right-3 z-10">
            <Button variant="ghost" size="icon" aria-label={t('editProfile')} className="h-10 w-10">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        )}
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4">
            <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
              <DialogTrigger asChild>
                <button type="button" className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-transform hover:scale-105 flex-shrink-0" aria-label="View profile picture">
                  <Avatar className="h-20 w-20 sm:h-24 border-2 border-primary shadow-md bg-muted">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/96x96.png?text=${avatarInitial}`} alt={user.name || user.username} data-ai-hint="person farmer" />
                    <AvatarFallback className="text-3xl sm:text-4xl">{avatarInitial}</AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              {user.avatarUrl ? <DialogOverlay className="bg-black/50 backdrop-blur-sm fixed inset-0 z-[51]" /> : null}
              <DialogContent className="p-0 max-w-md w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[52]">
                <DialogHeader className="sr-only"><DialogTitle>Enlarged Profile Picture of {user.name || user.username}</DialogTitle></DialogHeader>
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={`${user.name || user.username}'s profile picture`} width={400} height={400} className="rounded-lg object-contain max-h-[80vh] max-w-[80vw]" data-ai-hint="person farmer large" />
                ) : (
                  <div className="h-64 w-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-4xl">{avatarInitial}</div>
                )}
              </DialogContent>
            </Dialog>

            <div className="flex flex-1 justify-around items-center text-center w-full sm:w-auto sm:pt-2">
              <div className="px-2"><p className="text-lg font-semibold text-foreground">{user.postCount ?? 0}</p><p className="text-xs text-muted-foreground">{t('posts')}</p></div>
              <div className="px-2"><p className="text-lg font-semibold text-foreground">{localFollowersCount}</p><p className="text-xs text-muted-foreground">{t('followers')}</p></div>
              <Link href={`/profile/${user.id}/following`} className="hover:opacity-80 transition-opacity px-2"><p className="text-lg font-semibold text-foreground">{user.followingCount ?? 0}</p><p className="text-xs text-muted-foreground">{t('following')}</p></Link>
            </div>
          </div>

          <div className="text-left space-y-1 mt-2">
            <h1 className="text-lg font-semibold text-foreground">{user.name || user.username}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm text-foreground/90 leading-relaxed pt-1">{user.bio}</p>}
            <div className="flex flex-col sm:flex-row flex-wrap items-start justify-start gap-x-4 gap-y-1.5 text-sm text-muted-foreground pt-2">
              {user.location && (<div className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 text-primary" />{user.location}</div>)}
              {user.produce && user.produce.length > 0 && (<div className="flex items-center"><Leaf className="h-4 w-4 mr-1.5 text-primary" /><span>{t('specializesIn')}: {user.produce.join(', ')}</span></div>)}
            </div>
          </div>
        
          <div className="pt-4 mt-4 border-t">
            {isCurrentUser ? (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link href="/mandi?view=seller"><Store className="mr-1.5 h-4 w-4" /> {t('myListingsButton')}</Link></Button>
              </div>
            ) : (
              <div className="flex gap-2">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1" onClick={handleToggleFollow} disabled={followLoading}>
                    {followLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FollowIcon className="mr-1.5 h-4 w-4" />}
                    {followButtonText}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/messages/${user.id}`}><MessageSquare className="mr-1.5 h-4 w-4" /> {t('message')}</Link>
                  </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const ProfileDetails = React.memo(ProfileDetailsComponent);
