
// src/components/message/new-message-modal.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { placeholderUsers } from '@/lib/placeholders';
import type { User } from '@/types';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, query, getDocs } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface NewMessageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMessageModal({ isOpen, onOpenChange }: NewMessageModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const router = useRouter();
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      if (!db) {
        // Fallback for mock mode
        setAllUsers(placeholderUsers);
        setIsLoadingUsers(false);
        return;
      }
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
        });
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users for new message modal:", error);
        toast({ title: t('errorToastTitle'), description: "Could not load users list.", variant: "destructive" });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, toast, t]);

  const availableUsers = useMemo(() => {
    return allUsers.filter(user => user.id !== authUserId); // Exclude current user
  }, [allUsers, authUserId]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableUsers;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        (user.name && user.name.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, availableUsers]);

  const handleUserSelect = (userId: string) => {
    router.push(`/messages/${userId}`);
    onOpenChange(false); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl text-primary flex items-center">
            <UserPlus className="mr-2 h-6 w-6" /> {t('newMessageModalTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('newMessageModalDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchUsersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 text-sm"
            />
          </div>
          <ScrollArea className="h-[300px] border rounded-md">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-3"
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <Avatar className="h-9 w-9 mr-3 border">
                      <AvatarImage src={user.avatarUrl} alt={user.username} data-ai-hint="person user" />
                      <AvatarFallback>{(user.name || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-sm">{user.name || user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('noUsersFoundError')}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
