// src/components/comment/comment-item.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment as CommentType } from '@/types';
import { formatTimeAgo } from '@/lib/placeholders';
import { useTranslations } from '@/hooks/useTranslations';
import { db, Timestamp, collection, query, where, orderBy, limit, getDocs, startAfter, onSnapshot, doc } from '@/lib/firebase';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CommentItemProps {
  comment: CommentType;
  postId: string;
  onStartReply: (commentId: string, username: string) => void;
  currentUserId: string | null;
  onUpdate: (commentId: string, newText: string) => Promise<void>;
  onDelete: (commentId: string, parentId: string | null) => Promise<void>;
}

const REPLIES_PER_PAGE = 3;

const CommentItemComponent = ({ comment, postId, onStartReply, currentUserId, onUpdate, onDelete }: CommentItemProps) => {
  const { t } = useTranslations();
  const timeAgo = comment.createdAt instanceof Timestamp ? formatTimeAgo(comment.createdAt) : 'Invalid date';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [lastReplyDoc, setLastReplyDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(comment.replyCount ?? 0);

  const isOwner = currentUserId === comment.user.id;

  // Listen for real-time updates on reply count
  useEffect(() => {
    if (!db) return;
    const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
    const unsubscribe = onSnapshot(commentRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setLocalReplyCount(data.replyCount ?? 0);
        }
    });
    return () => unsubscribe();
  }, [postId, comment.id]);

  const fetchReplies = useCallback(async (loadMore = false) => {
    if (!db) return;
    setIsLoadingReplies(true);
    try {
        const repliesRef = collection(db, 'posts', postId, 'comments');
        let q;
        if (loadMore && lastReplyDoc) {
            q = query(repliesRef, where('parentId', '==', comment.id), orderBy('createdAt', 'asc'), startAfter(lastReplyDoc), limit(REPLIES_PER_PAGE));
        } else {
            q = query(repliesRef, where('parentId', '==', comment.id), orderBy('createdAt', 'asc'), limit(REPLIES_PER_PAGE));
        }
        
        const snapshot = await getDocs(q);
        const fetchedReplies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentType));
        
        setReplies(prev => loadMore ? [...prev, ...fetchedReplies] : fetchedReplies);
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastReplyDoc(newLastVisible);
        setHasMoreReplies(snapshot.docs.length === REPLIES_PER_PAGE);

    } catch (error) {
        console.error("Error fetching replies:", error);
    } finally {
        setIsLoadingReplies(false);
    }
  }, [postId, comment.id, lastReplyDoc]);

  useEffect(() => {
    if (showReplies && replies.length === 0 && localReplyCount > 0) {
      fetchReplies();
    }
    // This effect should only trigger when showReplies becomes true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReplies, localReplyCount]);
  
  useEffect(() => {
    setEditedText(comment.text);
  }, [comment.text]);
  
  const handleToggleReplies = () => {
    setShowReplies(prev => !prev);
  };
  
  const handleReplyClick = () => {
    onStartReply(comment.id, comment.user.username);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedText.trim() === comment.text.trim() || !editedText.trim()) {
        setIsEditing(false);
        setEditedText(comment.text); // revert changes if empty or same
        return;
    }
    await onUpdate(comment.id, editedText.trim());
    setIsEditing(false);
  };
  
  const handleDeleteClick = () => {
    onDelete(comment.id, comment.parentId || null);
  };

  const handleReplyDelete = async (replyIdToDelete: string, replysParentId: string | null) => {
    await onDelete(replyIdToDelete, replysParentId);
    setReplies(currentReplies => currentReplies.filter(r => r.id !== replyIdToDelete));
  };


  return (
    <>
      <div className="flex flex-col py-1">
        <div className="flex items-start space-x-3 group">
          <Link href={`/profile/${comment.user.id}`}>
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={comment.user.avatarUrl || `https://placehold.co/32x32.png?text=${comment.user.username.charAt(0)}`} alt={comment.user.username} data-ai-hint="person user" />
              <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="flex flex-col gap-2">
                <Textarea 
                  ref={editInputRef}
                  value={editedText} 
                  onChange={(e) => setEditedText(e.target.value)} 
                  rows={2}
                  className="text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => {setIsEditing(false); setEditedText(comment.text);}}>{t('cancelButtonText')}</Button>
                  <Button type="submit" size="sm">{t('saveButton')}</Button>
                </div>
              </form>
            ) : (
              <div className="text-sm bg-muted/30 p-2 rounded-md">
                <Link href={`/profile/${comment.user.id}`} className="font-semibold hover:underline">
                  {comment.user.name || comment.user.username}
                </Link>
                <span className="ml-1.5 text-foreground whitespace-pre-wrap">{comment.text}</span>
              </div>
            )}
            {!isEditing && (
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
              </div>
            )}
          </div>
          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setIsEditing(true); }}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>{t('editComment')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t('deleteComment')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {localReplyCount > 0 && (
            <div className="pl-5 ml-4 mt-2">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleToggleReplies}>
                    {showReplies ? t('hideReplies') : `${t('viewReplies', {count: localReplyCount})} `}
                </Button>
            </div>
        )}
        
        {showReplies && (
          <div className="mt-2 space-y-2 pl-5 border-l-2 border-muted/50 ml-4">
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                postId={postId}
                comment={reply}
                onStartReply={onStartReply}
                currentUserId={currentUserId}
                onUpdate={onUpdate}
                onDelete={handleReplyDelete}
              />
            ))}
            {isLoadingReplies && <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            {hasMoreReplies && !isLoadingReplies && (
                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => fetchReplies(true)}>
                    {t('loadMoreReplies')}
                </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCommentConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCommentConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancelButtonText')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClick} className="bg-destructive hover:bg-destructive/90">
              {t('deleteConfirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const CommentItem = React.memo(CommentItemComponent);
