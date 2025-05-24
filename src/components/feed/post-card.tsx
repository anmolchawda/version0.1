
'use client'; // Required for useState and window object

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';
import { ShareModal } from '../post/share-modal'; // Import the ShareModal

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatTimeAgo(post.createdAt);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postFullUrl, setPostFullUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPostFullUrl(`${window.location.origin}/post/${post.id}`);
    }
  }, [post.id]);

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
          <Link href={`/post/${post.id}`} className="block relative aspect-square sm:aspect-video w-full bg-muted cursor-pointer">
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-6 w-6" />
              <span className="sr-only">Like</span>
            </Button>
            <Link href={`/post/${post.id}#comments`}> {/* Link to comments section */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">Comment</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">Share</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full">
              <Bookmark className="h-6 w-6" />
              <span className="sr-only">Save</span>
            </Button>
          </div>
          
          {post.likesCount > 0 && (
            <p className="text-sm font-semibold">{post.likesCount} likes</p>
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
            <Link href={`/post/${post.id}`} className="text-sm text-muted-foreground hover:underline">
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
