
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Comment as CommentType, User } from '@/types';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp, writeBatch, Timestamp, increment, updateDoc, deleteDoc, arrayUnion, arrayRemove } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


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
  const [allComments, setAllComments] = useState<CommentType[]>([]);
  const [commentTree, setCommentTree] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<CommentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslations();
  const { toast } = useToast();
  const { authUserId } = useSidebarContext();

  useEffect(() => {
    if (!db || !postId) return;

    setIsLoading(true);
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CommentType));
      
      setAllComments(fetchedComments);
      setCommentTree(buildCommentTree(fetchedComments));
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
    setIsProcessing(true);

    try {
        const userDoc = await getDoc(doc(db, 'users', authUserId));
        if (!userDoc.exists()) {
            throw new Error("User data not found.");
        }
        const userData = userDoc.data() as User;
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
            likesCount: 0,
            likedBy: [],
        };
        
        const batch = writeBatch(db);
        batch.set(newCommentRef, commentToAdd);
        batch.update(postRef, { commentsCount: increment(1) });
        await batch.commit();

    } catch (error) {
        console.error("Error adding comment:", error);
        toast({ title: "Error", description: "Could not post your comment.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
        handleCancelReply();
    }
  };

  const handleToggleLike = async (commentId: string) => {
      if (!authUserId || !db) return;
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const isLiked = allComments.find(c => c.id === commentId)?.likedBy?.includes(authUserId);

      await updateDoc(commentRef, {
          likedBy: isLiked ? arrayRemove(authUserId) : arrayUnion(authUserId),
          likesCount: increment(isLiked ? -1 : 1)
      });
  };

  const handleEditComment = async (commentId: string, newText: string) => {
      if (!db) return;
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, { text: newText });
      toast({ title: "Comment Updated", description: "Your comment has been successfully updated." });
  };
  
  const getDescendantIds = (parentId: string, comments: CommentType[]): string[] => {
    const children = comments.filter(c => c.parentId === parentId);
    let descendantIds: string[] = children.map(c => c.id);
    children.forEach(child => {
        descendantIds = [...descendantIds, ...getDescendantIds(child.id, comments)];
    });
    return descendantIds;
  };

  const handleDeleteConfirmed = async () => {
    if (!commentToDelete || !db) return;
    setIsProcessing(true);

    const idsToDelete = [commentToDelete.id, ...getDescendantIds(commentToDelete.id, allComments)];
    const commentsCountChange = -idsToDelete.length;

    try {
      const batch = writeBatch(db);
      idsToDelete.forEach(id => {
        const commentRef = doc(db, 'posts', postId, 'comments', id);
        batch.delete(commentRef);
      });
      const postRef = doc(db, 'posts', postId);
      batch.update(postRef, { commentsCount: increment(commentsCountChange) });
      await batch.commit();

      toast({ title: "Comment Deleted", description: "The comment and its replies have been removed." });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: "Error", description: "Could not delete the comment.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setCommentToDelete(null);
    }
  };

  const totalCommentCount = allComments.length;

  return (
    <>
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
            ) : commentTree.length > 0 ? (
              commentTree.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onStartReply={handleStartReply}
                  onToggleLike={handleToggleLike}
                  onEdit={handleEditComment}
                  onDelete={() => setCommentToDelete(comment)}
                  currentUserId={authUserId}
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
      
      <AlertDialog open={!!commentToDelete} onOpenChange={(isOpen) => !isOpen && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment and all its replies? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
