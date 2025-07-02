'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Heart } from 'lucide-react';
import type { User } from '@/types';
import { db, collection, getDocs, doc, getDoc } from '@/lib/firebase';
import { useTranslations } from '@/hooks/useTranslations';


interface PostLikersModalProps {
  postId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostLikersModal({ postId, isOpen, onOpenChange }: PostLikersModalProps) {
  const [likers, setLikers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    if (!isOpen || !db) return;

    const fetchLikers = async () => {
      setIsLoading(true);
      try {
        const likedByRef = collection(db, 'posts', postId, 'likedByUsers');
        const querySnapshot = await getDocs(likedByRef);
        const userIds = querySnapshot.docs.map(d => d.id);

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
        console.error("Error fetching post likers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikers();
  }, [isOpen, postId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 border-b text-left">
          <DialogTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
            {t('likesLabel')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[350px]">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : likers.length > 0 ? (
              likers.map(user => (
                <Link key={user.id} href={`/profile/${user.id}`} onClick={() => onOpenChange(false)} className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors w-full">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.avatarUrl} alt={user.username} data-ai-hint="person user" />
                    <AvatarFallback>{(user.name || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{user.name || user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">No likes yet.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
