
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Facebook, MessageSquare, Link as LinkIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postUrl: string;
  postCaption?: string;
}

export function ShareModal({ isOpen, onOpenChange, postUrl, postCaption }: ShareModalProps) {
  const { toast } = useToast();

  const whatsAppText = postCaption 
    ? `Check out this post: ${postCaption.substring(0, 100)}... ${postUrl}` 
    : `Check out this post: ${postUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({ title: 'Link Copied!', description: 'Post link copied to clipboard.' });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Share Post</DialogTitle>
          <DialogDescription>
            Share this post with your friends on your favorite platforms.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={() => window.open(whatsAppUrl, '_blank')}
          >
            <MessageSquare className="mr-3 h-6 w-6 text-green-500" /> Share on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={() => window.open(facebookUrl, '_blank')}
          >
            <Facebook className="mr-3 h-6 w-6 text-blue-600" /> Share on Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={copyToClipboard}
          >
            <LinkIcon className="mr-3 h-6 w-6" /> Copy Link
          </Button>
        </div>
        {/* The X button was here, now removed */}
      </DialogContent>
    </Dialog>
  );
}
