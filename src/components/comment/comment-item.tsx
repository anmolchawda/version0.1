
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment as CommentType } from '@/types';
import { formatTimeAgo } from '@/lib/placeholders';
import { useTranslations } from '@/hooks/useTranslations';
import { Timestamp } from 'firebase/firestore';
import { Heart, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';


interface CommentItemProps {
  comment: CommentType;
  onStartReply: (commentId: string, username: string) => void;
  onToggleLike: (commentId: string) => void;
  onEdit: (commentId: string, newText: string) => void;
  onDelete: (comment: CommentType) => void;
  currentUserId: string | null;
  depth: number;
}

const CommentItemComponent = ({ comment, onStartReply, onToggleLike, onEdit, onDelete, currentUserId, depth }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const timeAgo = comment.createdAt instanceof Timestamp ? formatTimeAgo(comment.createdAt) : 'Invalid date';
  const { t } = useTranslations();
  
  const isOwnComment = currentUserId === comment.user.id;
  const isLiked = comment.likedBy?.includes(currentUserId || '') || false;
  
  const handleReplyClick = () => {
    onStartReply(comment.id, comment.user.username);
  };
  
  const handleSaveEdit = async () => {
    if (editText.trim() === comment.text || !editText.trim()) {
      setIsEditing(false);
      return;
    }
    setIsSubmittingEdit(true);
    await onEdit(comment.id, editText.trim());
    setIsSubmittingEdit(false);
    setIsEditing(false);
  };

  const indentationStyle = depth > 0 ? { marginLeft: `${depth * 1}rem`, paddingTop: '0.5rem', borderTop: depth === 1 ? '1px dashed hsl(var(--border))' : 'none' } : {};

  return (
    <div style={indentationStyle} className={`flex flex-col py-1`}>
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${comment.user.id}`}>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} data-ai-hint="person user" />
            <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isSubmittingEdit}>
                  {isSubmittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="text-sm bg-muted/30 p-2 rounded-md flex-1">
                  <Link href={`/profile/${comment.user.id}`} className="font-semibold hover:underline">
                    {comment.user.name || comment.user.username}
                  </Link>
                  <span className="ml-1.5 text-foreground">{comment.text}</span>
                </div>
                <div className="flex items-center ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleLike(comment.id)} disabled={!currentUserId}>
                    <Heart className={cn("h-4 w-4", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
                  </Button>
                  {isOwnComment && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(comment)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
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
                {(comment.likesCount ?? 0) > 0 && (
                   <p className="text-xs text-muted-foreground">
                    · {(comment.likesCount ?? 0)} {comment.likesCount === 1 ? t('likeCountSingular') : t('likeCountPlural')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1 space-y-1">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onStartReply={onStartReply}
              onToggleLike={onToggleLike}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const CommentItem = React.memo(CommentItemComponent);
