
// src/components/comment/comment-input.tsx
'use client';

import { useState, type RefObject } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Comment } from '@/types';
import { useTranslations } from '@/hooks/useTranslations'; // Import the hook

// Mock current user ID, replace with actual auth context later
const MOCK_CURRENT_USER_ID = '1';
const MOCK_CURRENT_USER_USERNAME = 'FarmerJohn';
const MOCK_CURRENT_USER_AVATAR = 'https://placehold.co/40x40.png?text=FJ';


interface CommentInputProps {
  postId: string;
  onCommentAdded: (newCommentData: Omit<Comment, 'id' | 'user' | 'createdAt' | 'replies'> & { text: string }) => void;
  replyingToUsername?: string | null;
  onCancelReply?: () => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
}

export function CommentInput({ postId, onCommentAdded, replyingToUsername, onCancelReply, textareaRef }: CommentInputProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations(); // Initialize the hook

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({
        title: t('emptyCommentErrorTitle'),
        description: t('emptyCommentErrorDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 750));

    // The parentId will be handled by CommentSection based on replyingToCommentId state
    onCommentAdded({
      postId,
      text: commentText.trim(),
    });
    
    setCommentText('');
    setIsSubmitting(false);
    toast({
      title: replyingToUsername ? t('replyPostedSuccess') : t('commentPostedSuccess'),
    });
  };

  const placeholderText = replyingToUsername 
    ? t('replyingToPlaceholder', { username: replyingToUsername })
    : t('addCommentPlaceholder');

  return (
    <form onSubmit={handleSubmitComment} className="flex flex-col space-y-2 py-4 border-t">
      {replyingToUsername && onCancelReply && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{t('replyingToPlaceholder', { username: replyingToUsername })}</span>
          <Button variant="ghost" size="sm" onClick={onCancelReply} className="p-1 h-auto">
            <XCircle className="h-3.5 w-3.5 mr-1"/> {t('cancelReply')}
          </Button>
        </div>
      )}
      <div className="flex items-start space-x-3">
        <Avatar className="h-9 w-9 mt-1">
           <AvatarImage src={MOCK_CURRENT_USER_AVATAR} alt={MOCK_CURRENT_USER_USERNAME} data-ai-hint="person user" />
           <AvatarFallback>{MOCK_CURRENT_USER_USERNAME.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Textarea
          ref={textareaRef}
          placeholder={placeholderText}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={1}
          className="flex-1 resize-none min-h-[40px] rounded-full px-4 py-2 focus-visible:ring-1"
          disabled={isSubmitting}
        />
        <Button type="submit" size="icon" className="rounded-full h-10 w-10" disabled={isSubmitting || !commentText.trim()}>
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">{replyingToUsername ? t('postReplyButton') : t('postCommentButton')}</span>
        </Button>
      </div>
    </form>
  );
}
