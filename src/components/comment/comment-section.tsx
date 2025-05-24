// src/components/comment/comment-section.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Comment as CommentType } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleCommentAdded = (newComment: CommentType) => {
    setComments(prevComments => [...prevComments, newComment]);
  };

  return (
    <Card className="mt-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto pr-2 -mr-2 space-y-1 divide-y">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
        <CommentInput postId={postId} onCommentAdded={handleCommentAdded} />
      </CardContent>
    </Card>
  );
}
