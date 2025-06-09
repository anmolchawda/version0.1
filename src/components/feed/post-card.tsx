
'use client';

import React, { useState, useEffect } from 'react'; // Added React import
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';
import { MOCK_USER_ID } from '@/lib/placeholders';
import { ShareModal } from '../post/share-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase'; // db can be null
import { doc, updateDoc, getDoc, setDoc, deleteDoc, increment, Timestamp } from 'firebase/firestore';
import { useTranslations } from '@/hooks/useTranslations'; // Import the hook

interface PostCardProps {
  post: Post;
  priority?: boolean; // For image optimization
}

const PostCardComponent = ({ post, priority = false }: PostCardProps) => {
  const timeAgo = formatTimeAgo(post.createdAt);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postFullUrl, setPostFullUrl] = useState('');
  const { toast } = useToast();
  const { t } = useTranslations(); // Initialize the hook

  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  const isFirestoreAvailable = db !== null; // Check if db instance is available

  useEffect(() => {
    if (!isFirestoreAvailable) {
      setIsLoadingLike(false);
      // In mock mode, we can assume posts are not liked by default or read from a mock state if needed
      setIsLiked(false); 
      setLocalLikesCount(post.likesCount); // Use initial prop value for mock
      return;
    }

    // Firestore-dependent logic
    const likedDocRef = doc(db, 'posts', post.id, 'likedByUsers', MOCK_USER_ID);
    const checkInitialLike = async () => {
      setIsLoadingLike(true);
      try {
        const docSnap = await getDoc(likedDocRef);
        setIsLiked(docSnap.exists());
      } catch (error) {
        console.error("Error checking initial like status:", error);
        // Don't toast here, could be noisy on initial load for many cards
      } finally {
        setIsLoadingLike(false);
      }
    };
    checkInitialLike();
    setLocalLikesCount(post.likesCount); // Sync with prop on initial load or post change
  }, [post.id, post.likesCount, isFirestoreAvailable]); 

  const getSavedPostsFromStorage = (): string[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`farmdocc_saved_posts_${MOCK_USER_ID}`);
    return saved ? JSON.parse(saved) : [];
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPostFullUrl(`${window.location.origin}/post/${post.id}`);
      const savedPosts = getSavedPostsFromStorage();
      setIsSaved(savedPosts.includes(post.id));
    }
  }, [post.id]);

  const handleToggleSave = () => {
    const savedPosts = getSavedPostsFromStorage();
    let updatedSavedPosts: string[];

    if (isSaved) {
      updatedSavedPosts = savedPosts.filter(id => id !== post.id);
      toast({ title: t('postUnsavedToastTitle'), description: t('postUnsavedToastDescription') });
    } else {
      updatedSavedPosts = [...savedPosts, post.id];
      toast({ title: t('postSavedToastTitle'), description: t('postSavedToastDescription') });
    }
    localStorage.setItem(`farmdocc_saved_posts_${MOCK_USER_ID}`, JSON.stringify(updatedSavedPosts));
    setIsSaved(!isSaved);
  };

  const handleToggleLike = async () => {
    if (isLoadingLike) return;
    setIsLoadingLike(true);

    const newLikedState = !isLiked;

    if (!isFirestoreAvailable) {
      // Mock mode: simulate like toggle
      setIsLiked(newLikedState);
      setLocalLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      toast({ title: newLikedState ? t('postLikedMockToastTitle') : t('postUnlikedMockToastTitle') });
      setIsLoadingLike(false);
      return;
    }

    // Firestore mode
    const likedDocRef = doc(db, 'posts', post.id, 'likedByUsers', MOCK_USER_ID);
    const postDocRef = doc(db, 'posts', post.id);

    try {
      if (newLikedState) {
        await setDoc(likedDocRef, { likedAt: Timestamp.now() });
        await updateDoc(postDocRef, {
          likesCount: increment(1)
        });
        setLocalLikesCount(prev => prev + 1);
      } else {
        await deleteDoc(likedDocRef);
        await updateDoc(postDocRef, {
          likesCount: increment(-1)
        });
        setLocalLikesCount(prev => Math.max(0, prev - 1));
      }
      setIsLiked(newLikedState);
    } catch (error) {
      console.error("Error updating like status:", error);
      toast({ title: t('errorToastTitle'), description: t('likeUpdateErrorToastDescription'), variant: "destructive" });
      // Revert optimistic updates if Firestore fails
      setLocalLikesCount(post.likesCount); 
      setIsLiked(!newLikedState); 
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
              <CardTitle className="text-sm font-semibold hover:underline">{post.user.username}</CardTitle>
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggleLike} disabled={isLoadingLike}>
              <Heart className={cn("h-6 w-6", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
              <span className="sr-only">Like</span>
            </Button>
            <Link href={`/post/${post.id}#comments`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">Comment</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">Share</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full" onClick={handleToggleSave}>
              <Bookmark className={`h-6 w-6 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              <span className="sr-only">Save</span>
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
