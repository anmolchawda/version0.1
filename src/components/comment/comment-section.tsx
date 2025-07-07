'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Comment as CommentType, User } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { db, collection, query, orderBy, addDoc, doc, getDoc, serverTimestamp, writeBatch, Timestamp, increment, deleteDoc, updateDoc, onSnapshot, where, getDocs, limit, startAfter, type QueryDocumentSnapshot, type DocumentData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface CommentSectionProps {
  postId: string;
}

const COMMENTS_PER_PAGE = 5;

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  const { toast } = useToast();

  const fetchComments = useCallback(async (loadMore = false) => {
    if (!db || !postId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      let q;
      if (loadMore && lastVisibleDoc) {
        q = query(commentsRef, where('parentId', '==', null), orderBy('createdAt', 'asc'), startAfter(lastVisibleDoc), limit(COMMENTS_PER_PAGE));
      } else {
        q = query(commentsRef, where('parentId', '==', null), orderBy('createdAt', 'asc'), limit(COMMENTS_PER_PAGE));
      }
      
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CommentType));
      
      setComments(prev => loadMore ? [...prev, ...fetchedComments] : fetchedComments);
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisibleDoc(newLastVisible);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);

    } catch (error) {
       console.error("Error fetching comments:", error);
       toast({ title: t('errorToastTitle'), description: "Could not load comments.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [postId, lastVisibleDoc, t, toast]);


  useEffect(() => {
    fetchComments();
    
    // Listener for total comments count
    const postRef = doc(db, 'posts', postId);
    const unsubscribePost = onSnapshot(postRef, (doc) => {
        if (doc.exists()) {
            setCommentsCount(doc.data().commentsCount || 0);
        }
    });

    return () => {
      unsubscribePost();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!userDoc.exists()) throw new Error("User data not found.");
        const userData = userDoc.data() as User;

        const batch = writeBatch(db);
        const postRef = doc(db, 'posts', postId);
        const newCommentRef = doc(collection(db, 'posts', postId, 'comments'));
        
        const commentToAdd: Omit<CommentType, 'id'> = {
            user: { id: authUserId, username: userData.username, name: userData.name, avatarUrl: userData.avatarUrl },
            postId: postId, text: newCommentData.text, createdAt: serverTimestamp() as Timestamp,
            parentId: replyingToCommentId, replyCount: 0,
        };
        
        batch.set(newCommentRef, commentToAdd);
        batch.update(postRef, { commentsCount: increment(1) });

        if (replyingToCommentId) {
            const parentCommentRef = doc(db, 'posts', postId, 'comments', replyingToCommentId);
            batch.update(parentCommentRef, { replyCount: increment(1) });
        }
        
        await batch.commit();
        
        // If it's a top-level comment, refresh the list to show it
        if (!replyingToCommentId) {
            fetchComments();
        }
        // Replies are handled inside CommentItem

    } catch (error) {
        console.error("Error adding comment:", error);
    }
    
    handleCancelReply();
  };
  
  const handleUpdateComment = async (commentId: string, newText: string) => {
    if (!db) return;
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    try {
      await updateDoc(commentRef, { text: newText });
      toast({ title: t('commentUpdatedSuccess') });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({ title: t('errorToastTitle'), description: t('commentUpdateFailed'), variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string, parentId: string | null) => {
    if (!db) return;
    
    // Basic deletion, does not handle recursive deletion of child replies
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const postRef = doc(db, 'posts', postId);
    
    try {
      const batch = writeBatch(db);
      
      const commentDoc = await getDoc(commentRef);
      if (!commentDoc.exists()) return;
      
      const commentData = commentDoc.data() as CommentType;
      const numToDelete = 1 + (commentData.replyCount || 0);

      // This is a simplified delete. A robust solution needs a cloud function for recursion.
      // We will just delete the comment and its direct replies if we fetch them.
      batch.delete(commentRef);
      batch.update(postRef, { commentsCount: increment(-numToDelete) });
      
      if (parentId) {
        const parentCommentRef = doc(db, 'posts', postId, 'comments', parentId);
        batch.update(parentCommentRef, { replyCount: increment(-1) });
      }
      
      await batch.commit();
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      toast({ title: t('commentDeletedSuccess') });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: t('errorToastTitle'), description: t('commentDeleteFailed'), variant: "destructive" });
    }
  };

  return (
    <Card id="comments" className="mt-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          {t('commentsTitle', { count: commentsCount })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                postId={postId}
                comment={comment} 
                onStartReply={handleStartReply}
                currentUserId={authUserId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))
          ) : !isLoading ? (
            <p className="py-4 text-sm text-muted-foreground text-center">{t('noCommentsYet')}</p>
          ) : null}
          {isLoading && (
             <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {hasMore && !isLoading && (
            <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => fetchComments(true)}>
                    {t('loadMoreComments')}
                </Button>
            </div>
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
