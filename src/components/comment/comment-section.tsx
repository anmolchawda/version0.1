
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Comment as CommentType, Post, User } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
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

  useEffect(() => {
    if (!db || !postId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const initialFetch = async () => {
      try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, where('parentId', '==', null), orderBy('createdAt', 'asc'), limit(COMMENTS_PER_PAGE));
        
        const snapshot = await getDocs(q);
        const fetchedComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as CommentType));
        
        setComments(fetchedComments);
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastVisibleDoc(newLastVisible);
        setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);

      } catch (error) {
         console.error("Error fetching initial comments:", error);
         toast({ title: t('errorToastTitle'), description: "Could not load comments.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();

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
  }, [postId, toast, t]);

  const loadMoreComments = useCallback(async () => {
    if (!db || !postId || !lastVisibleDoc) return;
    setIsLoading(true);

    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsRef, where('parentId', '==', null), orderBy('createdAt', 'asc'), startAfter(lastVisibleDoc), limit(COMMENTS_PER_PAGE));
      
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CommentType));
      
      setComments(prev => [...prev, ...fetchedComments]);
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisibleDoc(newLastVisible);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);

    } catch (error) {
       console.error("Error fetching more comments:", error);
       toast({ title: t('errorToastTitle'), description: "Could not load more comments.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [postId, lastVisibleDoc, t, toast]);


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
            parentId: replyingToCommentId, replyCount: 0, likesCount: 0,
        };
        
        batch.set(newCommentRef, commentToAdd);
        batch.update(postRef, { commentsCount: increment(1) });

        if (replyingToCommentId) {
            const parentCommentRef = doc(db, 'posts', postId, 'comments', replyingToCommentId);
            batch.update(parentCommentRef, { replyCount: increment(1) });
        }
        
        await batch.commit();
        
        if (!replyingToCommentId) {
            const newComment = { id: newCommentRef.id, ...commentToAdd } as CommentType;
            setComments(prev => [...prev, newComment]);
        }

        // --- Notification Logic ---
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            const postData = postDoc.data() as Post;
            const notificationBatch = writeBatch(db);
            const postOwnerId = postData.userId;

            // Notify post owner if someone else commented
            if (authUserId !== postOwnerId) {
                const notifRef = doc(collection(db, 'notifications', postOwnerId, 'items'));
                notificationBatch.set(notifRef, {
                    type: 'comment',
                    actor: { id: authUserId, name: userData.name, username: userData.username, avatarUrl: userData.avatarUrl },
                    targetUserId: postOwnerId,
                    postId: postId,
                    postImageUrl: postData.imageUrl || '',
                    commentText: newCommentData.text,
                    read: false,
                    timestamp: serverTimestamp(),
                });
            }

            // If it's a reply, notify parent comment owner
            if (replyingToCommentId) {
                const parentCommentDoc = await getDoc(doc(db, 'posts', postId, 'comments', replyingToCommentId));
                if (parentCommentDoc.exists()) {
                    const parentCommentData = parentCommentDoc.data() as CommentType;
                    const parentOwnerId = parentCommentData.user.id;
                    if (authUserId !== parentOwnerId && parentOwnerId !== postOwnerId) {
                        const replyNotifRef = doc(collection(db, 'notifications', parentOwnerId, 'items'));
                        notificationBatch.set(replyNotifRef, {
                            type: 'comment',
                            actor: { id: authUserId, name: userData.name, username: userData.username, avatarUrl: userData.avatarUrl },
                            targetUserId: parentOwnerId,
                            postId: postId,
                            postImageUrl: postData.imageUrl || '',
                            commentText: newCommentData.text,
                            read: false,
                            timestamp: serverTimestamp(),
                        });
                    }
                }
            }
            await notificationBatch.commit();
        }

    } catch (error) {
        console.error("Error adding comment or notification:", error);
    }
    
    handleCancelReply();
  };
  
  const handleUpdateComment = async (commentId: string, newText: string) => {
    if (!db) return;
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    try {
      await updateDoc(commentRef, { text: newText });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: newText } : c));
      toast({ title: t('commentUpdatedSuccess') });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({ title: t('errorToastTitle'), description: t('commentUpdateFailed'), variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string, parentId: string | null) => {
    if (!db) return;
    
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const postRef = doc(db, 'posts', postId);
    
    try {
      const batch = writeBatch(db);
      
      const commentDoc = await getDoc(commentRef);
      if (!commentDoc.exists()) return;
      
      const commentData = commentDoc.data() as CommentType;
      // Note: This simplified delete won't recursively find all child replies.
      // A robust solution would use a Cloud Function for recursive deletion.
      const numToDelete = 1 + (commentData.replyCount || 0);

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
                <Button variant="outline" size="sm" onClick={loadMoreComments}>
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
