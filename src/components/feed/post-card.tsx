
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post, User } from '@/types';
import { Heart, MessageCircle, Send, Bookmark, Loader2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';
import { ShareModal } from '../post/share-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db, doc, updateDoc, getDoc, setDoc, deleteDoc, increment, serverTimestamp, writeBatch, Timestamp, collection } from '@/lib/firebase';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

const PostCardComponent = ({ post, priority = false }: PostCardProps) => {
  const { t } = useTranslations();
  const timeAgo = post.createdAt instanceof Timestamp ? formatTimeAgo(post.createdAt) : 'Invalid date';
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postFullUrl, setPostFullUrl] = useState('');
  const { toast } = useToast();
  const { authUserId } = useSidebarContext();

  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);
  const [isLoadingLike, setIsLoadingLike] = useState(true);
  const [isLoadingSave, setIsLoadingSave] = useState(true);

  const isFirestoreAvailable = db !== null;

  useEffect(() => {
    if (!isFirestoreAvailable || !authUserId) {
      setIsLoadingLike(false);
      setIsLoadingSave(false);
      return;
    }

    let isMounted = true;

    const checkInitialStatus = async () => {
      if (!db || !isMounted) return;

      const likedDocRef = doc(db, 'posts', post.id, 'likedByUsers', authUserId);
      const savedDocRef = doc(db, 'users', authUserId, 'bookmarks', post.id);

      try {
        const [likeDocSnap, saveDocSnap] = await Promise.all([
            getDoc(likedDocRef),
            getDoc(savedDocRef)
        ]);
        if (isMounted) {
            setIsLiked(likeDocSnap.exists());
            setIsSaved(saveDocSnap.exists());
        }
      } catch (error) {
        console.error("Error checking initial post status:", error);
      } finally {
        if (isMounted) {
            setIsLoadingLike(false);
            setIsLoadingSave(false);
        }
      }
    };

    checkInitialStatus();
    setLocalLikesCount(post.likesCount);

    return () => {
      isMounted = false;
    };
  }, [post.id, post.likesCount, isFirestoreAvailable, authUserId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPostFullUrl(`${window.location.origin}/post/${post.id}`);
    }
  }, [post.id]);

  const handleToggleSave = async () => {
    if (isLoadingSave || !authUserId || !isFirestoreAvailable) return;
    setIsLoadingSave(true);

    const savedDocRef = doc(db, 'users', authUserId, 'bookmarks', post.id);
    const newSavedState = !isSaved;

    try {
      if (newSavedState) {
        await setDoc(savedDocRef, { postId: post.id, savedAt: serverTimestamp() });
        toast({ title: t('postSavedToastTitle'), description: t('postSavedToastDescription') });
      } else {
        await deleteDoc(savedDocRef);
        toast({ title: t('postUnsavedToastTitle'), description: t('postUnsavedToastDescription') });
      }
      setIsSaved(newSavedState);
    } catch (error) {
      console.error("Error updating save status:", error);
      toast({ title: t('errorToastTitle'), description: "Could not update save status.", variant: "destructive" });
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLoadingLike || !authUserId || !isFirestoreAvailable) return;
    setIsLoadingLike(true);

    const newLikedState = !isLiked;
    const likedDocRef = doc(db, 'posts', post.id, 'likedByUsers', authUserId);
    const postDocRef = doc(db, 'posts', post.id);
    
    setIsLiked(newLikedState);
    setLocalLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const batch = writeBatch(db);
      if (newLikedState) {
        batch.set(likedDocRef, { likedAt: serverTimestamp() });
        batch.update(postDocRef, { likesCount: increment(1) });
        
        if (authUserId !== post.user.id) {
          const currentUserDoc = await getDoc(doc(db, 'users', authUserId));
          if(currentUserDoc.exists()){
            const currentUserData = currentUserDoc.data() as User;
            const notificationRef = doc(collection(db, 'notifications', post.user.id, 'items'));
            batch.set(notificationRef, {
                type: 'like',
                actor: {
                    id: authUserId,
                    username: currentUserData.username,
                    name: currentUserData.name,
                    avatarUrl: currentUserData.avatarUrl,
                },
                targetUserId: post.user.id,
                postId: post.id,
                postImageUrl: post.imageUrl || '',
                read: false,
                timestamp: serverTimestamp(),
            });
          }
        }
      } else {
        batch.delete(likedDocRef);
        batch.update(postDocRef, { likesCount: increment(-1) });
      }
      await batch.commit();

    } catch (error) {
      console.error("Error updating like status:", error);
      toast({ title: t('errorToastTitle'), description: t('likeUpdateErrorToastDescription'), variant: "destructive" });
      setIsLiked(!newLikedState);
      setLocalLikesCount(post.likesCount);
    } finally {
      setIsLoadingLike(false);
    }
  };


  return (
    <>
      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="flex flex-row items-center space-x-3 p-4">
          <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={post.user.avatarUrl || `https://placehold.co/40x40.png?text=${post.user.username.charAt(0)}`} alt={post.user.username} data-ai-hint="person farmer" />
              <AvatarFallback>{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-semibold hover:underline">{post.user.name || post.user.username}</CardTitle>
              {post.user.location && <p className="text-xs text-muted-foreground">{post.user.location}</p>}
            </div>
          </Link>
        </CardHeader>
        
        {post.imageUrl && (
          <Link href={`/post/${post.id}#comments`} className="block relative aspect-square sm:aspect-video w-full bg-muted cursor-pointer">
            <Image
              src={post.imageUrl}
              alt={`Post by ${post.user.username}: ${post.caption.substring(0,50)}`}
              fill
              style={{objectFit:"cover"}}
              className="rounded-none"
              data-ai-hint="farm field crop"
              priority={priority}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 672px"
            />
          </Link>
        )}

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggleLike} disabled={isLoadingLike || !authUserId}>
              {isLoadingLike ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className={cn("h-6 w-6", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />}
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
            <Link href={`/post/${post.id}#comments`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">{t('commentAction')}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">{t('shareAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full" onClick={handleToggleSave} disabled={isLoadingSave || !authUserId}>
              {isLoadingSave ? <Loader2 className="h-6 w-6 animate-spin" /> : <Bookmark className={cn("h-6 w-6", isSaved ? "fill-primary text-primary" : "text-muted-foreground")} />}
              <span className="sr-only">{t('saveAction')}</span>
            </Button>
          </div>
          
          {localLikesCount > 0 && (
             <p className="text-sm font-semibold">
              {localLikesCount} {localLikesCount === 1 ? t('likeCountSingular') : t('likeCountPlural')}
            </p>
          )}

          <p className="text-sm">
            <Link href={`/profile/${post.user.id}`} className="font-semibold hover:underline">{post.user.username}</Link>
            <span className="ml-1">{post.caption}</span>
          </p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <Link href={`/discover?tag=${tag.replace('#', '')}`} key={tag}>
                  <Badge variant="outline" className="text-primary hover:bg-primary/10 cursor-pointer">{tag}</Badge>
                </Link>
              ))}
            </div>
          )}

          {post.commentsCount > 0 && (
            <Link href={`/post/${post.id}#comments`} className="text-sm text-muted-foreground hover:underline">
              {t('viewAllCommentsText', { count: post.commentsCount })}
            </Link>
          )}
          <p className="text-xs text-muted-foreground uppercase">{timeAgo}</p>
        </CardContent>
      </Card>

      {postFullUrl && (
        <ShareModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postUrl={postFullUrl}
          postCaption={post.caption}
        />
      )}
    </>
  );
}

export const PostCard = React.memo(PostCardComponent);
