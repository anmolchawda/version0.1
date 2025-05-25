
// src/app/(app)/messages/[userId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Send, MoreVertical, Phone, Video, Trash2, ShieldAlert, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPlaceholderUser, getPlaceholderMessagesForChat, MOCK_USER_ID, formatTimeAgo } from '@/lib/placeholders';
import type { User, ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userId = params.userId as string;
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (userId) {
      const partner = getPlaceholderUser(userId);
      setChatPartner(partner || null);
      const chatMessages = getPlaceholderMessagesForChat(userId);
      setMessages(chatMessages);
    }
  }, [userId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatPartner) return;
    const newMsgObject: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: MOCK_USER_ID,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsgObject]);
    setNewMessage('');
  };

  if (!chatPartner) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chat or user not found...</p>
      </div>
    );
  }
  const currentUser = getPlaceholderUser(MOCK_USER_ID);

  const handleAction = (action: string) => {
    toast({
      title: `${action} (Simulated)`,
      description: `The '${action.toLowerCase()}' action for ${chatPartner.name || chatPartner.username} would be processed here.`,
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-0rem)]"> {/* Adjusted height */}
      <Card className="shadow-none rounded-none border-0 flex-grow flex flex-col overflow-hidden">
        {/* Chat Header */}
        <CardHeader className="flex flex-row items-center space-x-3 p-3 border-b sticky top-0 bg-card z-10">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={chatPartner.avatarUrl} alt={chatPartner.name || chatPartner.username} data-ai-hint="person user"/>
            <AvatarFallback>{(chatPartner.name || chatPartner.username)?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h2 className="font-semibold text-base">{chatPartner.name || chatPartner.username}</h2>
            <p className="text-xs text-muted-foreground">Online</p> {/* Placeholder status */}
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction('Delete Conversation')}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Delete Conversation</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('Block User')}>
                <UserX className="mr-2 h-4 w-4" />
                <span>Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('Report User')}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                <span>Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
          {messages.map((msg) => {
            const isCurrentUserSender = msg.senderId === MOCK_USER_ID;
            const senderDetails = isCurrentUserSender ? currentUser : chatPartner;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end space-x-2 max-w-[75%]",
                  isCurrentUserSender ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                )}
              >
                 {!isCurrentUserSender && (
                    <Link href={`/profile/${senderDetails?.id}`}>
                        <Avatar className="h-7 w-7 border self-start shrink-0">
                        <AvatarImage src={senderDetails?.avatarUrl} alt={senderDetails?.username} data-ai-hint="person user"/>
                        <AvatarFallback>{senderDetails?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                 )}
                <div
                  className={cn(
                    "p-3 rounded-xl shadow-md",
                    isCurrentUserSender
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={cn("text-xs mt-1", isCurrentUserSender ? "text-primary-foreground/70" : "text-muted-foreground/70", isCurrentUserSender ? "text-right" : "text-left")}>
                    {formatTimeAgo(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
           {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              No messages yet. Start the conversation!
            </div>
          )}
        </ScrollArea>

        {/* Message Input Area */}
        <CardFooter className="p-3 border-t sticky bottom-0 bg-card">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow rounded-full py-2.5 px-4 h-auto text-sm"
              autoComplete="off"
            />
            <Button type="submit" size="icon" className="rounded-full h-10 w-10 bg-accent hover:bg-accent/80" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
