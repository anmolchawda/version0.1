
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Comment as CommentType, User } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp, writeBatch, Timestamp, increment } from '@/lib/firebase';
import { getPlaceholderUser } from '@/lib/placeholders';

interface CommentSectionProps {
  postId: string;
}

const buildCommentTree = (comments: CommentType[], parentId: string | null = null): CommentType[] => {
  return comments
    .filter(comment => comment.parentId === parentId)
    .map(comment => ({
      ...comment,
      replies: buildCommentTree(comments, comment.id),
    })).sort((a, b) => new Date((a.createdAt as Timestamp).toDate()).getTime() - new Date((b.createdAt as Timestamp).toDate()).getTime());
};

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();

  useEffect(() => {
    if (!db || !postId) return;

    setIsLoading(true);
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CommentType));
      
      const commentTree = buildCommentTree(fetchedComments);
      setComments(commentTree);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

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

  const handleCommentAdded = async (newCommentData: { text: string }) => {
    if (!authUserId || !db) return;

    try {
        const userDoc = await getDoc(doc(db, 'users', authUserId));
        if (!userDoc.exists()) {
            throw new Error("User data not found.");
        }
        const userData = userDoc.data() as User;

        const batch = writeBatch(db);
        const postRef = doc(db, 'posts', postId);
        const newCommentRef = doc(collection(db, 'posts', postId, 'comments'));
        
        const commentToAdd = {
            user: {
                id: authUserId,
                username: userData.username,
                name: userData.name,
                avatarUrl: userData.avatarUrl,
            },
            postId: postId,
            text: newCommentData.text,
            createdAt: serverTimestamp(),
            parentId: replyingToCommentId,
        };

        batch.set(newCommentRef, commentToAdd);
        batch.update(postRef, { commentsCount: increment(1) });
        
        await batch.commit();

    } catch (error) {
        console.error("Error adding comment:", error);
    }
    
    handleCancelReply();
  };
  
  const countTotalComments = (commentList: CommentType[]): number => {
    let count = 0;
    for (const comment of commentList) {
      count++;
      if (comment.replies && comment.replies.length > 0) {
        count += countTotalComments(comment.replies);
      }
    }
    return count;
  };
  const totalCommentCount = countTotalComments(comments);

  return (
    <Card id="comments" className="mt-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          {t('commentsTitle', { count: totalCommentCount })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto pr-2 -mr-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onStartReply={handleStartReply}
                depth={0} 
              />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground text-center">{t('noCommentsYet')}</p>
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
