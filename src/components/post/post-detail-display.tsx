
// src/components/post/post-detail-display.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark, CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/placeholders';
import { ShareModal } from './share-modal';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { Timestamp } from 'firebase/firestore';
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { db, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface PostDetailDisplayProps {
  post: Post;
}

export function PostDetailDisplay({ post }: PostDetailDisplayProps) {
  const timeAgo = post.createdAt instanceof Timestamp ? formatTimeAgo(post.createdAt) : 'Invalid date';
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentPostUrl, setCurrentPostUrl] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPostUrl(window.location.href);
    }
    
    if (!authUserId || !db) {
        setIsLoadingSave(false);
        return;
    }

    const checkSaveStatus = async () => {
        setIsLoadingSave(true);
        const savedDocRef = doc(db, 'users', authUserId, 'bookmarks', post.id);
        try {
            const docSnap = await getDoc(savedDocRef);
            setIsSaved(docSnap.exists());
        } catch (e) {
            console.error("Error checking save status", e);
        } finally {
            setIsLoadingSave(false);
        }
    };
    checkSaveStatus();
  }, [post.id, authUserId]);

  const handleToggleSave = async () => {
    if (isLoadingSave || !authUserId || !db) return;
    setIsLoadingSave(true);

    const savedDocRef = doc(db, 'users', authUserId, 'bookmarks', post.id);
    const newSavedState = !isSaved;

    try {
      if (newSavedState) {
        await setDoc(savedDocRef, { postId: post.id, savedAt: serverTimestamp() });
        toast({ title: t('postSavedToastTitle'), description: t('postSavedToastDescription') });
      } else {
        await deleteDoc(savedDocRef);
        toast({ title: t('postUnsavedToastTitle'), description: t('postUnsavedToastDescription') });
      }
      setIsSaved(newSavedState);
    } catch (error) {
      console.error("Error updating save status:", error);
      toast({ title: "Error", description: "Could not update save status.", variant: "destructive" });
    } finally {
      setIsLoadingSave(false);
    }
  };


  return (
    <>
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center space-x-3 p-3 sm:p-4 bg-card border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label={t('backButton')}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 w-6" />
          </Button>
          <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-2 sm:space-x-3 flex-grow">
            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-primary">
              <AvatarImage src={post.user.avatarUrl || `https://placehold.co/44x44.png?text=${post.user.username.charAt(0)}`} alt={post.user.username} data-ai-hint="person farmer" />
              <AvatarFallback className="text-base sm:text-lg">{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <CardTitle className="text-sm sm:text-md font-semibold hover:underline truncate">{post.user.username}</CardTitle>
              {post.user.location && <p className="text-xs text-muted-foreground truncate">{post.user.location}</p>}
            </div>
          </Link>
        </CardHeader>
        
        {post.imageUrl && (
          <div className="relative w-full bg-muted" style={{ aspectRatio: '1 / 1' }}>
            <Image
              src={post.imageUrl}
              alt={`Post by ${post.user.username}: ${post.caption.substring(0,50)}`}
              fill
              style={{objectFit: "cover"}}
              className="rounded-none"
              data-ai-hint="farm field crop"
              priority
            />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <p className="text-sm">{post.caption}</p>

          {(post.hashtags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags?.map((tag) => (
                <Link href={`/discover?tag=${tag.replace('#', '')}`} key={tag}>
                  <Badge variant="secondary" className="text-primary hover:bg-primary/10 cursor-pointer py-1 px-2.5">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground pt-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {timeAgo}
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t flex flex-col items-start space-y-3">
          <div className="flex items-center space-x-2 w-full">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
              <Heart className="h-6 w-6" />
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">{t('commentAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">{t('shareAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full hover:bg-accent/20" onClick={handleToggleSave} disabled={isLoadingSave || !authUserId}>
              {isLoadingSave ? <Loader2 className="h-6 w-6 animate-spin" /> : <Bookmark className={cn("h-6 w-6", isSaved ? "fill-primary text-primary" : "text-muted-foreground")} />}
              <span className="sr-only">{t('saveAction')}</span>
            </Button>
          </div>
          
          {post.likesCount > 0 && (
            <p className="text-sm font-semibold">{post.likesCount} {post.likesCount === 1 ? t('likeCountSingular') : t('likeCountPlural')}</p>
          )}
        </CardFooter>
      </Card>
      
      {currentPostUrl && (
        <ShareModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postUrl={currentPostUrl}
          postCaption={post.caption}
        />
      )}
    </>
  );
}
