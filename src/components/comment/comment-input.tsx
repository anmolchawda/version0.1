// src/components/comment/comment-input.tsx
'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock current user ID, replace with actual auth context later
const MOCK_CURRENT_USER_ID = '1';
const MOCK_CURRENT_USER_USERNAME = 'FarmerJohn';
const MOCK_CURRENT_USER_AVATAR = 'https://placehold.co/40x40.png?text=FJ';


interface CommentInputProps {
  postId: string;
  onCommentAdded: (newComment: { user: { id: string; username: string; avatarUrl?: string }, text: string, createdAt: string, id: string, postId: string }) => void;
}

export function CommentInput({ postId, onCommentAdded }: CommentInputProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({
        title: 'Empty Comment',
        description: 'Please write something before posting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 750));

    const newComment = {
      id: `c${Date.now()}`, // Mock ID
      postId,
      user: { 
        id: MOCK_CURRENT_USER_ID, 
        username: MOCK_CURRENT_USER_USERNAME,
        avatarUrl: MOCK_CURRENT_USER_AVATAR,
      },
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    
    onCommentAdded(newComment);
    setCommentText('');
    setIsSubmitting(false);
    toast({
      title: 'Comment Posted!',
    });
  };

  return (
    <form onSubmit={handleSubmitComment} className="flex items-start space-x-3 py-4 border-t">
      <Avatar className="h-9 w-9 mt-1">
         <AvatarImage src={MOCK_CURRENT_USER_AVATAR} alt={MOCK_CURRENT_USER_USERNAME} data-ai-hint="person user" />
         <AvatarFallback>{MOCK_CURRENT_USER_USERNAME.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Textarea
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={1}
        className="flex-1 resize-none min-h-[40px] rounded-full px-4 py-2 focus-visible:ring-1"
        disabled={isSubmitting}
      />
      <Button type="submit" size="icon" className="rounded-full h-10 w-10" disabled={isSubmitting || !commentText.trim()}>
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        <span className="sr-only">Post comment</span>
      </Button>
    </form>
  );
}
