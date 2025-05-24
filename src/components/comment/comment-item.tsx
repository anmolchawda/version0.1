// src/components/comment/comment-item.tsx
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Comment as CommentType } from '@/types';
import { formatTimeAgo } from '@/lib/placeholders'; // Using the new utility

interface CommentItemProps {
  comment: CommentType;
}

export function CommentItem({ comment }: CommentItemProps) {
  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <div className="flex items-start space-x-3 py-3">
      <Link href={`/profile/${comment.user.id}`}>
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={comment.user.avatarUrl || `https://placehold.co/32x32.png?text=${comment.user.username.charAt(0)}`} alt={comment.user.username} data-ai-hint="person user" />
          <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="text-sm">
          <Link href={`/profile/${comment.user.id}`} className="font-semibold hover:underline">
            {comment.user.username}
          </Link>
          <span className="ml-1.5 text-foreground">{comment.text}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}
