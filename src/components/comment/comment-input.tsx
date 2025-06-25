
// src/components/comment/comment-input.tsx
'use client';

import { useState, type RefObject, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { getPlaceholderUser } from '@/lib/placeholders'; // For fallback
import { db, doc, getDoc } from '@/lib/firebase';
import type { User } from '@/types';

interface CommentInputProps {
  postId: string;
  onCommentAdded: (newCommentData: { text: string }) => void;
  replyingToUsername?: string | null;
  onCancelReply?: () => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
}

export function CommentInput({ postId, onCommentAdded, replyingToUsername, onCancelReply, textareaRef }: CommentInputProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();

  useEffect(() => {
    const fetchUser = async () => {
      if (authUserId && db) {
        const userDoc = await getDoc(doc(db, 'users', authUserId));
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // Fallback to placeholder if profile fetch fails, though unlikely
          setCurrentUser(getPlaceholderUser(authUserId));
        }
      } else {
         setCurrentUser(null);
      }
    };
    fetchUser();
  }, [authUserId]);

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
    await onCommentAdded({
      text: commentText.trim(),
    });
    
    setCommentText('');
    setIsSubmitting(false);
  };

  const placeholderText = replyingToUsername 
    ? t('replyingToPlaceholder', { username: replyingToUsername })
    : t('addCommentPlaceholder');
    
  const avatarFallback = currentUser?.name?.charAt(0).toUpperCase() || currentUser?.username?.charAt(0).toUpperCase() || 'U';

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
           <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.username} data-ai-hint="person user" />
           <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <Textarea
          ref={textareaRef}
          placeholder={placeholderText}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={1}
          className="flex-1 resize-none min-h-[40px] rounded-full px-4 py-2 focus-visible:ring-1"
          disabled={isSubmitting || !authUserId}
        />
        <Button type="submit" size="icon" className="rounded-full h-10 w-10" disabled={isSubmitting || !commentText.trim() || !authUserId}>
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">{replyingToUsername ? t('postReplyButton') : t('postCommentButton')}</span>
        </Button>
      </div>
    </form>
  );
}
