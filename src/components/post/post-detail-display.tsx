// src/components/post/post-detail-display.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark, CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';
import { ShareModal } from './share-modal';
import { LikesModal } from './likes-modal'; // Import the new modal
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { Timestamp } from 'firebase/firestore';
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { db, doc, getDoc, setDoc, deleteDoc, serverTimestamp, writeBatch, increment } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface PostDetailDisplayProps {
  post: Post;
}

export function PostDetailDisplay({ post }: PostDetailDisplayProps) {
  const timeAgo = post.createdAt instanceof Timestamp ? formatTimeAgo(post.createdAt) : 'Invalid date';
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false); // State for the new modal
  const [currentPostUrl, setCurrentPostUrl] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(true);

  // New state for likes
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);
  const [isLoadingLike, setIsLoadingLike] = useState(true);

  const isFirestoreAvailable = db !== null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPostUrl(window.location.href);
    }
    
    if (!authUserId || !isFirestoreAvailable) {
        setIsLoadingSave(false);
        setIsLoadingLike(false);
        return;
    }

    let isMounted = true;

    const checkStatus = async () => {
        if (!db || !isMounted) return;
        setIsLoadingSave(true);
        setIsLoadingLike(true);

        const savedDocRef = doc(db, 'users', authUserId, 'bookmarks', post.id);
        const likedDocRef = doc(db, 'posts', post.id, 'likedByUsers', authUserId);

        try {
            const [saveDocSnap, likeDocSnap] = await Promise.all([
                getDoc(savedDocRef),
                getDoc(likedDocRef),
            ]);
            if (isMounted) {
                setIsSaved(saveDocSnap.exists());
                setIsLiked(likeDocSnap.exists());
            }
        } catch (e) {
            console.error("Error checking post status", e);
        } finally {
            if (isMounted) {
                setIsLoadingSave(false);
                setIsLoadingLike(false);
            }
        }
    };
    checkStatus();
    setLocalLikesCount(post.likesCount);

    return () => { isMounted = false; };
  }, [post.id, post.likesCount, authUserId, isFirestoreAvailable]);

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
      toast({ title: "Error", description: "Could not update save status.", variant: "destructive" });
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
    
    // Optimistic UI update
    setIsLiked(newLikedState);
    setLocalLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const batch = writeBatch(db);
      if (newLikedState) {
        batch.set(likedDocRef, { likedAt: serverTimestamp() });
        batch.update(postDocRef, { likesCount: increment(1) });
      } else {
        batch.delete(likedDocRef);
        batch.update(postDocRef, { likesCount: increment(-1) });
      }
      await batch.commit();
    } catch (error) {
      console.error("Error updating like status:", error);
      toast({ title: t('errorToastTitle'), description: t('likeUpdateErrorToastDescription'), variant: "destructive" });
      // Revert optimistic updates
      setIsLiked(!newLikedState);
      setLocalLikesCount(post.likesCount);
    } finally {
      setIsLoadingLike(false);
    }
  };


  return (
    <>
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center space-x-3 p-3 sm:p-4 bg-card border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label={t('backButton')}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 w-6" />
          </Button>
          <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-2 sm:space-x-3 flex-grow">
            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-primary">
              <AvatarImage src={post.user.avatarUrl || `https://placehold.co/44x44.png?text=${post.user.username.charAt(0)}`} alt={post.user.username} data-ai-hint="person farmer" />
              <AvatarFallback className="text-base sm:text-lg">{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <CardTitle className="text-sm sm:text-md font-semibold hover:underline truncate">{post.user.username}</CardTitle>
              {post.user.location && <p className="text-xs text-muted-foreground truncate">{post.user.location}</p>}
            </div>
          </Link>
        </CardHeader>
        
        {post.imageUrl && (
          <div className="relative w-full bg-muted" style={{ aspectRatio: '1 / 1' }}>
            <Image
              src={post.imageUrl}
              alt={`Post by ${post.user.username}: ${post.caption.substring(0,50)}`}
              fill
              style={{objectFit: "cover"}}
              className="rounded-none"
              data-ai-hint="farm field crop"
              priority
            />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <p className="text-sm">{post.caption}</p>

          {(post.hashtags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags?.map((tag) => (
                <Link href={`/discover?tag=${tag.replace('#', '')}`} key={tag}>
                  <Badge variant="secondary" className="text-primary hover:bg-primary/10 cursor-pointer py-1 px-2.5">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground pt-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {timeAgo}
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t flex flex-col items-start space-y-3">
          <div className="flex items-center space-x-2 w-full">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20" onClick={handleToggleLike} disabled={isLoadingLike || !authUserId}>
               {isLoadingLike ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className={cn("h-6 w-6", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />}
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">{t('commentAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">{t('shareAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full hover:bg-accent/20" onClick={handleToggleSave} disabled={isLoadingSave || !authUserId}>
              {isLoadingSave ? <Loader2 className="h-6 w-6 animate-spin" /> : <Bookmark className={cn("h-6 w-6", isSaved ? "fill-primary text-primary" : "text-muted-foreground")} />}
              <span className="sr-only">{t('saveAction')}</span>
            </Button>
          </div>
          
          {localLikesCount > 0 && (
            <Button variant="link" className="p-0 h-auto text-sm font-semibold text-foreground hover:no-underline" onClick={() => setIsLikesModalOpen(true)}>
              <Heart className="h-4 w-4 mr-1.5 fill-muted-foreground text-muted-foreground" />
              {localLikesCount} {localLikesCount === 1 ? t('likeCountSingular') : t('likeCountPlural')}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {currentPostUrl && (
        <ShareModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postUrl={currentPostUrl}
          postCaption={post.caption}
        />
      )}
      <LikesModal
        isOpen={isLikesModalOpen}
        onOpenChange={setIsLikesModalOpen}
        postId={post.id}
      />
    </>
  );
}
