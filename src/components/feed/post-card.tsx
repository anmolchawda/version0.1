
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { formatTimeAgo, getPlaceholderUser } from '@/lib/placeholders';
import { ShareModal } from '../post/share-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

const MOCK_USER_ID = '1'; // Simulate a logged-in user

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatTimeAgo(post.createdAt);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postFullUrl, setPostFullUrl] = useState('');
  const { toast } = useToast();

  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);

  const getSavedPostsFromStorage = (): string[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`farmdocc_saved_posts_${MOCK_USER_ID}`);
    return saved ? JSON.parse(saved) : [];
  };

  const getLikedPostsFromStorage = (): string[] => {
    if (typeof window === 'undefined') return [];
    const liked = localStorage.getItem(`farmdocc_liked_posts_${MOCK_USER_ID}`);
    return liked ? JSON.parse(liked) : [];
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPostFullUrl(`${window.location.origin}/post/${post.id}`);
      
      const savedPosts = getSavedPostsFromStorage();
      setIsSaved(savedPosts.includes(post.id));

      const likedPosts = getLikedPostsFromStorage();
      setIsLiked(likedPosts.includes(post.id));
      setLocalLikesCount(post.likesCount); // Initialize with server count
    }
  }, [post.id, post.likesCount]);

  const handleToggleSave = () => {
    const savedPosts = getSavedPostsFromStorage();
    let updatedSavedPosts: string[];

    if (savedPosts.includes(post.id)) {
      updatedSavedPosts = savedPosts.filter(id => id !== post.id);
      toast({ title: "Post Unsaved", description: "Removed from your favorites." });
    } else {
      updatedSavedPosts = [...savedPosts, post.id];
      toast({ title: "Post Saved!", description: "Added to your favorites." });
    }
    localStorage.setItem(`farmdocc_saved_posts_${MOCK_USER_ID}`, JSON.stringify(updatedSavedPosts));
    setIsSaved(!isSaved);
  };

  const handleToggleLike = () => {
    const likedPosts = getLikedPostsFromStorage();
    let updatedLikedPosts: string[];

    if (isLiked) {
      updatedLikedPosts = likedPosts.filter(id => id !== post.id);
      setLocalLikesCount(prev => prev - 1);
      toast({ title: "Post Unliked" });
    } else {
      updatedLikedPosts = [...likedPosts, post.id];
      setLocalLikesCount(prev => prev + 1);
      toast({ title: "Post Liked!" });
    }
    localStorage.setItem(`farmdocc_liked_posts_${MOCK_USER_ID}`, JSON.stringify(updatedLikedPosts));
    setIsLiked(!isLiked);
    // In a real app, you'd also update the backend here.
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
              layout="fill"
              objectFit="cover"
              className="rounded-none"
              data-ai-hint="farm field crop"
            />
          </Link>
        )}

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggleLike}>
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
            <p className="text-sm font-semibold">{localLikesCount} {localLikesCount === 1 ? 'like' : 'likes'}</p>
          )}

          <p className="text-sm">
            <Link href={`/profile/${post.user.id}`} className="font-semibold hover:underline">{post.user.username}</Link>
            <span className="ml-1">{post.caption}</span>
          </p>

          {post.hashtags.length > 0 && (
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
              View all {post.commentsCount} comments
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

