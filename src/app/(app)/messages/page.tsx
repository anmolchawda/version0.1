// src/app/(app)/messages/page.tsx
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Search, Edit3, Users } from 'lucide-react'; // Using Users as placeholder for conversation icon
import { placeholderUsers } from '@/lib/placeholders'; // For mock data
import type { User } from '@/types';

interface MockConversation {
  id: string;
  user: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>;
  lastMessage: string;
  lastMessageTime: string; // e.g., "2h ago", "Yesterday"
  unread?: boolean;
}

// Create mock conversations using placeholder users
const mockConversations: MockConversation[] = placeholderUsers.slice(0, 3).map((user, index) => ({
  id: `conv_${user.id}`,
  user: {
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    avatarUrl: user.avatarUrl,
  },
  lastMessage: index === 0 ? "Hey, how are you doing?" : (index === 1 ? "Sure, sounds good! See you then." : "Can you send me the details? Thanks!"),
  lastMessageTime: index === 0 ? "2h ago" : (index === 1 ? "Yesterday" : "10:30 AM"),
  unread: index === 0,
}));


export default function MessagesPage() {
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-5rem)]"> {/* Adjust height based on navbars */}
      <Card className="shadow-xl rounded-xl flex-grow flex flex-col overflow-hidden">
        <CardHeader className="border-b sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <MessageSquareText className="mr-3 h-7 w-7" />
              Messages
            </CardTitle>
            <Button variant="ghost" size="icon" aria-label="New message">
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages or users..."
              className="w-full pl-10 py-2 rounded-lg"
            />
          </div>
        </CardHeader>

        <ScrollArea className="flex-grow">
          <CardContent className="p-0">
            {mockConversations.length > 0 ? (
              <div className="divide-y">
                {mockConversations.map((convo) => (
                  <Link key={convo.id} href={`#`} passHref> {/* Placeholder link, replace with actual chat route later */}
                    <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <Avatar className="h-12 w-12 mr-4 border">
                        <AvatarImage src={convo.user.avatarUrl} alt={convo.user.name} data-ai-hint="person user"/>
                        <AvatarFallback>{convo.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-semibold truncate ${convo.unread ? 'text-foreground' : 'text-foreground'}`}>
                            {convo.user.name}
                          </h3>
                          <span className={`text-xs ${convo.unread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {convo.lastMessageTime}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${convo.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {convo.lastMessage}
                        </p>
                      </div>
                       {convo.unread && (
                        <div className="ml-2 h-2.5 w-2.5 rounded-full bg-primary self-center shrink-0"></div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Users className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-xl font-semibold text-foreground">No Messages Yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a new conversation to see your messages here.
                </p>
                <Button className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Edit3 className="mr-2 h-4 w-4" /> Start a New Chat
                </Button>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
