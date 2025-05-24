// src/components/post/post-detail-display.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark, CalendarDays } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';

interface PostDetailDisplayProps {
  post: Post;
}

export function PostDetailDisplay({ post }: PostDetailDisplayProps) {
  const timeAgo = formatTimeAgo(post.createdAt);

  return (
    <Card className="overflow-hidden shadow-xl rounded-xl">
      <CardHeader className="flex flex-row items-center space-x-3 p-4 bg-card">
        <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-3">
          <Avatar className="h-11 w-11 border-2 border-primary">
            <AvatarImage src={post.user.avatarUrl || `https://placehold.co/44x44.png?text=${post.user.username.charAt(0)}`} alt={post.user.username} data-ai-hint="person farmer" />
            <AvatarFallback className="text-lg">{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-md font-semibold hover:underline">{post.user.username}</CardTitle>
            {post.user.location && <p className="text-xs text-muted-foreground">{post.user.location}</p>}
          </div>
        </Link>
      </CardHeader>
      
      {post.imageUrl && (
        <div className="relative w-full bg-muted" style={{ aspectRatio: '1 / 1' }}> {/* Common aspect ratio for feed images */}
          <Image
            src={post.imageUrl}
            alt={`Post by ${post.user.username}: ${post.caption.substring(0,50)}`}
            layout="fill"
            objectFit="cover"
            className="rounded-none"
            data-ai-hint="farm field crop"
            priority // Prioritize loading image for LCP
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        <p className="text-sm">{post.caption}</p>

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
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
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
            <Heart className="h-6 w-6" />
            <span className="sr-only">Like</span>
          </Button>
          {/* Comment button might trigger scroll or focus on comment input in more advanced setup */}
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
            <Send className="h-6 w-6" />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="ghost" size="icon" className="ml-auto rounded-full hover:bg-accent/20">
            <Bookmark className="h-6 w-6" />
            <span className="sr-only">Save</span>
          </Button>
        </div>
        
        {post.likesCount > 0 && (
          <p className="text-sm font-semibold">{post.likesCount} likes</p>
        )}
      </CardFooter>
    </Card>
  );
}
