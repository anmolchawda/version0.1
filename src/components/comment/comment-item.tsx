// src/components/comment/comment-item.tsx
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'; // Added Button
import { useToast } from '@/hooks/use-toast'; // Added useToast
import type { Comment as CommentType } from '@/types';
import { formatTimeAgo } from '@/lib/placeholders';

interface CommentItemProps {
  comment: CommentType;
}

export function CommentItem({ comment }: CommentItemProps) {
  const timeAgo = formatTimeAgo(comment.createdAt);
  const { toast } = useToast(); // Initialize toast

  const handleReply = () => {
    // Placeholder for reply functionality
    toast({
      title: 'Reply (WIP)',
      description: `Replying to @${comment.user.username}'s comment. Feature coming soon!`,
    });
    console.log(`Replying to comment ID: ${comment.id} by @${comment.user.username}`);
  };

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
        <div className="flex items-center space-x-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={handleReply}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
