
// src/components/comment/comment-section.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Comment as CommentType } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

// Mock current user for adding new comments
const MOCK_CURRENT_USER_ID = '1';
const MOCK_CURRENT_USER_USERNAME = 'FarmerJohn';
const MOCK_CURRENT_USER_AVATAR = 'https://placehold.co/40x40.png?text=FJ';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[]; // Now expects a tree structure
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleStartReply = (commentId: string, username: string) => {
    setReplyingToCommentId(commentId);
    setReplyingToUsername(username);
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyingToUsername(null);
  };

  const addReplyToTree = (
    nodes: CommentType[],
    targetParentId: string,
    replyToAdd: CommentType
  ): CommentType[] => {
    return nodes.map(node => {
      if (node.id === targetParentId) {
        return {
          ...node,
          replies: [...(node.replies || []), replyToAdd].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        };
      }
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: addReplyToTree(node.replies, targetParentId, replyToAdd),
        };
      }
      return node;
    });
  };

  const handleCommentAdded = (newCommentData: Omit<CommentType, 'id' | 'user' | 'createdAt' | 'replies'> & { text: string }) => {
    const newCommentEntry: CommentType = {
      ...newCommentData,
      id: `c${Date.now()}`, // Mock ID
      user: { 
        id: MOCK_CURRENT_USER_ID, 
        username: MOCK_CURRENT_USER_USERNAME,
        avatarUrl: MOCK_CURRENT_USER_AVATAR,
      },
      createdAt: new Date().toISOString(),
      parentId: replyingToCommentId, // Set parentId if it's a reply
      replies: [], // New comments/replies don't have replies initially
    };

    if (replyingToCommentId) {
      setComments(prevComments => addReplyToTree(prevComments, replyingToCommentId, newCommentEntry));
    } else {
      // Add as a top-level comment
      setComments(prevComments => [...prevComments, newCommentEntry].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    }
    
    // Reset reply state
    handleCancelReply();
  };
  
  const countTotalComments = (commentList: CommentType[]): number => {
    let count = 0;
    for (const comment of commentList) {
      count++; // Count the comment itself
      if (comment.replies && comment.replies.length > 0) {
        count += countTotalComments(comment.replies); // Recursively count replies
      }
    }
    return count;
  };
  const totalCommentCount = countTotalComments(comments);


  return (
    <Card className="mt-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          Comments ({totalCommentCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto pr-2 -mr-2 space-y-1">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onStartReply={handleStartReply}
                depth={0} 
              />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
        <CommentInput
          postId={postId}
          onCommentAdded={handleCommentAdded}
          replyingToUsername={replyingToUsername}
          onCancelReply={handleCancelReply}
          textareaRef={commentInputRef}
        />
      </CardContent>
    </Card>
  );
}
