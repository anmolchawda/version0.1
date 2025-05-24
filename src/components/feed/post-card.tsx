import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
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
        <div className="relative aspect-square sm:aspect-video w-full bg-muted">
          <Image
            src={post.imageUrl}
            alt={`Post by ${post.user.username}`}
            layout="fill"
            objectFit="cover"
            className="rounded-none"
            data-ai-hint="farm field"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Heart className="h-6 w-6" />
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
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
          <Link href={`/post/${post.id}/comments`} className="text-sm text-muted-foreground hover:underline">
            View all {post.commentsCount} comments
          </Link>
        )}
        <p className="text-xs text-muted-foreground uppercase">{timeAgo}</p>
      </CardContent>
    </Card>
  );
}
