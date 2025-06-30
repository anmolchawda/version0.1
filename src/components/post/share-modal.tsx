
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Facebook, MessageSquare, Link as LinkIcon, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { placeholderUsers, MOCK_USER_ID } from '@/lib/placeholders';
   import type { User } from '@/types';
   
interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postUrl: string;
  postCaption?: string;
}

export function ShareModal({ isOpen, onOpenChange, postUrl, postCaption }: ShareModalProps) {
  const { toast } = useToast();
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);

  const whatsAppText = postCaption
    ? `Check out this post on KrishiX: ${postCaption.substring(0, 100)}... ${postUrl}`
    : `Check out this post on KrishiX: ${postUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;

  useEffect(() => {
    // Mock fetching of following list for MOCK_USER_ID
    let followed: User[] = [];
    // This mock logic assumes MOCK_USER_ID '1' (FarmerJohn) follows users '2' and '3'.
    // Adjust as needed for your placeholder data.
    if (MOCK_USER_ID === '1') { 
      followed = [
        placeholderUsers.find(u => u.id === '2'), // GreenThumbSarah
        placeholderUsers.find(u => u.id === '3'), // UrbanHarvester
      ].filter((u): u is User => u !== undefined);
    } else if (MOCK_USER_ID === '2') {
       followed = [
        placeholderUsers.find(u => u.id === '1'), // FarmerJohn
      ].filter((u): u is User => u !== undefined);
    }
    // Add more conditions if other mock users follow people
    setFollowedUsers(followed);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({ title: 'Link Copied!', description: 'Post link copied to clipboard.' });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    });
  };

  const handleSendMessageToUser = (user: User) => {
    toast({
      title: 'Post Shared (Simulated)',
      description: `Post link sent to @${user.username} in messages.`,
    });
    // onOpenChange(false); // Optionally close modal
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Share Post</DialogTitle>
          <DialogDescription className="sr-only">
            Share this post with others or send it as a message.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start text-base sm:text-lg py-5 sm:py-6"
            onClick={() => window.open(whatsAppUrl, '_blank')}
          >
            <MessageSquare className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-500" /> Share on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-base sm:text-lg py-5 sm:py-6"
            onClick={() => window.open(facebookUrl, '_blank')}
          >
            <Facebook className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /> Share on Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-base sm:text-lg py-5 sm:py-6"
            onClick={copyToClipboard}
          >
            <LinkIcon className="mr-3 h-5 w-5 sm:h-6 sm:w-6" /> Copy Link
          </Button>

          <Separator className="my-3" />

          <div>
            <h3 className="mb-2.5 text-sm font-medium text-muted-foreground">Send as message</h3>
            {followedUsers.length > 0 ? (
              <ScrollArea className="h-[160px] w-full rounded-md border p-1.5">
                <div className="space-y-1.5">
                  {followedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.avatarUrl || `https://placehold.co/36x36.png?text=${user.username.charAt(0)}`} alt={user.username} data-ai-hint="person user" />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium leading-tight truncate">{user.name || user.username}</p>
                          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-2.5 py-1 h-auto text-xs shrink-0" 
                        onClick={() => handleSendMessageToUser(user)}
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-1.5" /> Send
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                You are not following anyone to share with directly.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
