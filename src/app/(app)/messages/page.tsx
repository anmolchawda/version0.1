
// src/app/(app)/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Search, Edit3, Users, Loader2 } from 'lucide-react';
import { getPlaceholderUser, formatTimeAgo } from '@/lib/placeholders'; // Keep formatTimeAgo if needed
import type { DisplayConversation, FirestoreConversation, User } from '@/types';
import { NewMessageModal } from '@/components/message/new-message-modal';
import { auth, db, collection, query, where, orderBy, onSnapshot, Timestamp, doc, getDoc } from '@/lib/firebase'; // Import doc and getDoc, db can be null
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [conversations, setConversations] = useState<DisplayConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { authUserId } = useSidebarContext(); 
  const { t } = useTranslations();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!authUserId) {
      console.warn("[MessagesPage] No authUserId found in context. User might not be logged in.");
      setError(t('userNotAuthenticatedError'));
      setIsLoading(false);
      return;
    }

    if (!db) { 
      console.log("[MessagesPage] MOCK_DATA mode: db is null. Displaying empty conversations list.");
      setConversations([]); 
      setIsLoading(false);
      return;
    }

    const conversationsCollectionRef = collection(db, 'conversations');
    const q = query(
      conversationsCollectionRef,
      where('participants', 'array-contains', authUserId),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedConversations: DisplayConversation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreConversation;
        const otherParticipantId = data.participants.find(pId => pId !== authUserId);

        if (otherParticipantId) {
          let otherParticipantDetails = data.participantDetails?.[otherParticipantId];
          
          if (!otherParticipantDetails) {
            const placeholder = getPlaceholderUser(otherParticipantId);
            if (placeholder) {
              otherParticipantDetails = { 
                id: placeholder.id, 
                username: placeholder.username, 
                name: placeholder.name, 
                avatarUrl: placeholder.avatarUrl 
              };
            } else {
              otherParticipantDetails = { 
                id: otherParticipantId, 
                username: 'Unknown User', 
                name: 'Unknown User', 
                avatarUrl: undefined 
              };
            }
          }
          
          const lastRead = data.readStatus?.[authUserId] as Timestamp | undefined;
          const isUnread = 
            data.lastMessageTimestamp &&
            data.lastMessageSenderId !== authUserId &&
            (!lastRead || data.lastMessageTimestamp.toMillis() > lastRead.toMillis());

          fetchedConversations.push({
            id: docSnap.id,
            otherParticipant: otherParticipantDetails,
            lastMessage: data.lastMessageText || 'No messages yet',
            lastMessageTime: data.lastMessageTimestamp ? formatTimeAgo(data.lastMessageTimestamp as Timestamp) : '',
            unread: !!isUnread, 
          });
        }
      });
      setConversations(fetchedConversations);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error fetching conversations:", err);
      setError(t('failedToLoadConversationsError'));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authUserId, router, t]); 

  return (
    <>
      <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-5rem)]">
        <Card className="shadow-xl rounded-xl flex-grow flex flex-col overflow-hidden">
          <CardHeader className="border-b sticky top-0 bg-card z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <MessageSquareText className="mr-3 h-7 w-7" />
                {t('messagesTitle')}
              </CardTitle>
              <Button variant="ghost" size="icon" aria-label={t('newMessageAriaLabel')} onClick={() => setIsNewMessageModalOpen(true)}>
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchMessagesPlaceholder')}
                className="w-full pl-10 py-2 rounded-lg"
              />
            </div>
          </CardHeader>

          <ScrollArea className="flex-grow">
            <CardContent className="p-0">
              {isLoading && (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
              )}
              {!isLoading && error && (
                <div className="text-center py-20 text-destructive">{error}</div>
              )}
              {!isLoading && !error && conversations.length > 0 ? (
                <div className="divide-y">
                  {conversations.map((convo) => (
                    <Link key={convo.id} href={`/messages/${convo.otherParticipant.id}`} passHref>
                      <div className={cn(
                        "flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                        convo.unread && "bg-primary/5"
                        )}>
                        <Avatar className="h-12 w-12 mr-4 border">
                          <AvatarImage src={convo.otherParticipant.avatarUrl} alt={convo.otherParticipant.name || convo.otherParticipant.username} data-ai-hint="person user"/>
                          <AvatarFallback>{(convo.otherParticipant.name || convo.otherParticipant.username)?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h3 className={cn("font-semibold truncate", convo.unread ? 'text-foreground' : 'text-foreground')}>
                              {convo.otherParticipant.name || convo.otherParticipant.username}
                            </h3>
                            <span className={cn("text-xs", convo.unread ? 'text-primary font-medium' : 'text-muted-foreground')}>
                              {convo.lastMessageTime}
                            </span>
                          </div>
                          <p className={cn("text-sm truncate", convo.unread ? 'text-foreground font-medium' : 'text-muted-foreground')}>
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
                !isLoading && !error && (
                  <div className="text-center py-20">
                    <Users className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-xl font-semibold text-foreground">{t('noMessagesYetTitle')}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('noMessagesYetDescription')}
                    </p>
                    <Button className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setIsNewMessageModalOpen(true)}>
                      <Edit3 className="mr-2 h-4 w-4" /> {t('startNewChatButton')}
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onOpenChange={setIsNewMessageModalOpen}
      />
    </>
  );
}
