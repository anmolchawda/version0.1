
// src/components/comment/comment-item.tsx
import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Comment as CommentType } from '@/types';
import { formatTimeAgo } from '@/lib/placeholders';
import { useTranslations } from '@/hooks/useTranslations';
import { Timestamp } from 'firebase/firestore';

interface CommentItemProps {
  comment: CommentType;
  onStartReply: (commentId: string, username: string) => void;
  depth: number; // For indentation and reply logic
}

const CommentItemComponent = ({ comment, onStartReply, depth }: CommentItemProps) => {
  const timeAgo = comment.createdAt instanceof Timestamp ? formatTimeAgo(comment.createdAt) : 'Invalid date';
  const { t } = useTranslations();

  const handleReplyClick = () => {
    onStartReply(comment.id, comment.user.username);
  };

  const indentClass = depth > 0 ? `ml-${depth * 2}` : ''; // Tailwind JIT might need specific classes like ml-4, ml-8 or use style
  const indentationStyle = depth > 0 ? { marginLeft: `${depth * 1}rem`, paddingTop: '0.5rem', borderTop: depth === 1 ? '1px dashed hsl(var(--border))' : 'none' } : {};


  return (
    <div style={indentationStyle} className={`flex flex-col ${indentClass} py-1`}>
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${comment.user.id}`}>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={comment.user.avatarUrl || `https://placehold.co/32x32.png?text=${comment.user.username.charAt(0)}`} alt={comment.user.username} data-ai-hint="person user" />
            <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="text-sm bg-muted/30 p-2 rounded-md">
            <Link href={`/profile/${comment.user.id}`} className="font-semibold hover:underline">
              {comment.user.name || comment.user.username}
            </Link>
            <span className="ml-1.5 text-foreground">{comment.text}</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5 pl-2">
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
              onClick={handleReplyClick}
            >
              {t('replyButtonText')}
            </Button>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1 space-y-1">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onStartReply={onStartReply} // Pass down the original handler
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const CommentItem = React.memo(CommentItemComponent);
