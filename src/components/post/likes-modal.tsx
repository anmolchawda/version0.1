// src/components/post/likes-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Heart } from 'lucide-react';
import type { User } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';

interface LikesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export function LikesModal({ isOpen, onOpenChange, postId }: LikesModalProps) {
  const { t } = useTranslations();
  const [likers, setLikers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId || !db) return;

    const fetchLikers = async () => {
      setIsLoading(true);
      try {
        const likedByRef = collection(db, 'posts', postId, 'likedByUsers');
        const q = query(likedByRef);
        const snapshot = await getDocs(q);
        const userIds = snapshot.docs.map(d => d.id);
        
        if (userIds.length > 0) {
          const userPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
          const userDocs = await Promise.all(userPromises);
          
          const fetchedLikers = userDocs
            .filter(d => d.exists())
            .map(d => ({ id: d.id, ...d.data() } as User));
            
          setLikers(fetchedLikers);
        } else {
          setLikers([]);
        }
      } catch (error) {
        console.error("Error fetching likers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikers();
  }, [isOpen, postId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl text-primary flex items-center justify-center">
            <Heart className="mr-2 h-6 w-6 fill-primary" />
            {t('likesByTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Users who liked this post.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-2">
          <ScrollArea className="h-72">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : likers.length > 0 ? (
              <div className="space-y-4">
                {likers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md"
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={user.avatarUrl} alt={user.username} data-ai-hint="person user"/>
                      <AvatarFallback>{(user.name || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{user.name || user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground pt-10">
                {t('noLikesYet')}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
