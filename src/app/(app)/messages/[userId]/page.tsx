
// src/app/(app)/messages/[userId]/page.tsx
'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Send, MoreVertical, Phone, Video, Trash2, ShieldAlert, UserX, Paperclip, X as XIcon, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { getPlaceholderUser, formatTimeAgo } from '@/lib/placeholders';
import type { User, ChatMessage, FirestoreMessage, FirestoreConversation } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { auth, db, collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp, Timestamp, where, getDocs, getDoc, updateDoc } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

// Helper to generate a consistent conversation ID
const getFirestoreConversationId = (uid1: string, uid2: string): string => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const chatPartnerId = params.userId as string;
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const currentAuthUser = auth?.currentUser;

  useEffect(() => {
    if (!currentAuthUser) {
      router.push('/login');
      return;
    }

    let unsubscribeMessages: (() => void) | null = null;

    const setupChat = async () => {
      setIsLoadingMessages(true);
      setError(null);
      
      if (!db) {
        // Mock mode for environments where Firebase is not initialized
        const partner = getPlaceholderUser(chatPartnerId);
        const currentUser = getPlaceholderUser(currentAuthUser.uid);
        setChatPartner(partner || null);
        setCurrentUserProfile(currentUser || null);
        if (!partner) setError("Chat partner not found.");
        setIsLoadingMessages(false);
        return;
      }

      try {
        // Fetch both partner and current user data in parallel
        const [partnerDocSnap, currentUserDocSnap] = await Promise.all([
          getDoc(doc(db, 'users', chatPartnerId)),
          getDoc(doc(db, 'users', currentAuthUser.uid))
        ]);

        if (!partnerDocSnap.exists()) {
          throw new Error("Chat partner not found in database.");
        }
        if (!currentUserDocSnap.exists()) {
          throw new Error("Current user profile not found. Please complete your profile setup.");
        }
        
        const partnerData = { id: partnerDocSnap.id, ...partnerDocSnap.data() } as User;
        const currentUserData = { id: currentUserDocSnap.id, ...currentUserDocSnap.data() } as User;
        
        setChatPartner(partnerData);
        setCurrentUserProfile(currentUserData);

        const convId = getFirestoreConversationId(currentAuthUser.uid, chatPartnerId);
        setConversationId(convId);

        // Mark conversation as read
        const convRef = doc(db, 'conversations', convId);
        await setDoc(convRef, {
            readStatus: {
                [currentAuthUser.uid]: serverTimestamp()
            }
        }, { merge: true }).catch(e => console.error("Could not mark as read", e));


        const messagesCollectionRef = collection(db, 'conversations', convId, 'messages');
        const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

        unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
          const fetchedMessages: ChatMessage[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as FirestoreMessage;
            fetchedMessages.push({
              id: docSnap.id,
              senderId: data.senderId,
              text: data.text,
              timestamp: data.timestamp,
              mediaUrl: data.mediaUrl,
              mediaType: data.mediaType,
            });
          });
          setMessages(fetchedMessages);
          setIsLoadingMessages(false);
        }, (err) => {
          console.error("Error fetching messages: ", err);
          setError("Failed to load messages.");
          setIsLoadingMessages(false);
        });

      } catch (e) {
        console.error("Error setting up chat:", e);
        setError(e instanceof Error ? e.message : "Could not start chat.");
        setIsLoadingMessages(false);
        setChatPartner(null);
      }
    };

    setupChat();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [chatPartnerId, currentAuthUser, router]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleMediaFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "File Too Large", description: "Please select a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30) { 
            toast({ title: 'Video Too Long', description: 'Please select a video 30 seconds or shorter.', variant: 'destructive'});
            clearSelectedMedia(); return;
          }
          setSelectedFile(file); setSelectedFileName(file.name);
        };
        video.onerror = () => { toast({ title: 'Error Reading Video', variant: 'destructive' }); clearSelectedMedia(); }
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        setSelectedFile(file); setSelectedFileName(file.name);
      } else {
        toast({ title: 'Unsupported File Type', description: 'Please select an image or video.', variant: 'destructive' });
        clearSelectedMedia();
      }
    }
  };

  const clearSelectedMedia = () => {
    setSelectedFile(null); setSelectedFileName(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentAuthUser || !conversationId || !currentUserProfile || !chatPartner || !db) return;
    if (!newMessage.trim() && !selectedFile) return;

    const messageText = newMessage.trim();
    const messageData: Omit<FirestoreMessage, 'id'> = {
      senderId: currentAuthUser.uid,
      text: messageText,
      timestamp: serverTimestamp() as Timestamp,
    };

    if (selectedFile) {
      messageData.mediaUrl = `mock-upload-path/${selectedFile.name}`; 
      messageData.mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      toast({ title: "Media Upload (Simulated)", description: `${selectedFile.name} would be uploaded.`, duration: 2000 });
    }

    try {
      const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesCollectionRef, messageData);

      const conversationDocRef = doc(db, 'conversations', conversationId);
       
      // Using set with merge to create or update the conversation document
      await setDoc(conversationDocRef, {
        participants: [currentAuthUser.uid, chatPartnerId].sort(),
        participantDetails: {
          [currentAuthUser.uid]: {
            id: currentUserProfile.id,
            username: currentUserProfile.username,
            name: currentUserProfile.name,
            avatarUrl: currentUserProfile.avatarUrl,
          },
          [chatPartnerId]: {
            id: chatPartner.id,
            username: chatPartner.username,
            name: chatPartner.name,
            avatarUrl: chatPartner.avatarUrl,
          }
        },
        lastMessageText: messageText || (messageData.mediaType ? `${messageData.mediaType.charAt(0).toUpperCase() + messageData.mediaType.slice(1)} sent` : "Media sent"),
        lastMessageTimestamp: serverTimestamp() as Timestamp,
        lastMessageSenderId: currentAuthUser.uid,
        [`readStatus.${currentAuthUser.uid}`]: serverTimestamp() // Update sender's read status with dot notation
      }, { merge: true }); // Merge ensures we don't overwrite the other user's read status

      setNewMessage('');
      clearSelectedMedia();
    } catch (err) {
      console.error("Error sending message: ", err);
      toast({ title: 'Error Sending Message', description: 'Please try again.', variant: 'destructive' });
    }
  };


  if (!currentAuthUser) { 
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Authenticating...</p></div>;
  }
  
  if (error && !isLoadingMessages) {
     return <div className="flex items-center justify-center h-full p-4 text-center text-destructive">{error}</div>;
  }

  const handleDropdownAction = (action: string) => {
    toast({
      title: `${action} (Simulated)`,
      description: `The '${action.toLowerCase()}' action for ${chatPartner?.name || chatPartner?.username} would be processed here.`,
    });
  };

  const handleDeleteConfirmed = () => {
    toast({
      title: "Conversation Deleted (Simulated)",
      description: `Conversation with ${chatPartner?.name || chatPartner?.username} has been removed.`,
    });
    router.push('/messages');
  };


  return (
    <>
      <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-0rem)]">
        <Card className="shadow-none rounded-none border-0 flex-grow flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center space-x-3 p-3 border-b sticky top-0 bg-card z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            {chatPartner ? (
              <>
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={chatPartner.avatarUrl} alt={chatPartner.name || chatPartner.username} data-ai-hint="person user"/>
                  <AvatarFallback>{(chatPartner.name || chatPartner.username)?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h2 className="font-semibold text-base">{chatPartner.name || chatPartner.username}</h2>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </>
            ) : (
                <div className="flex-grow"><Loader2 className="h-5 w-5 animate-spin" /></div>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" disabled={!chatPartner}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDeleteConfirmDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  <span className="text-destructive">Delete Conversation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDropdownAction('Block User')}>
                  <UserX className="mr-2 h-4 w-4" />
                  <span>Block User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDropdownAction('Report User')}>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {isLoadingMessages && (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            )}
            {!isLoadingMessages && messages.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                No messages yet. Start the conversation!
              </div>
            )}
            {!isLoadingMessages && messages.map((msg) => {
              const isCurrentUserSender = msg.senderId === currentAuthUser.uid;
              const senderDetails = isCurrentUserSender ? currentUserProfile : chatPartner;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end space-x-2 max-w-[75%]",
                    isCurrentUserSender ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                  )}
                >
                  {!isCurrentUserSender && senderDetails && (
                      <Link href={`/profile/${senderDetails.id}`}>
                          <Avatar className="h-7 w-7 border self-start shrink-0">
                          <AvatarImage src={senderDetails.avatarUrl} alt={senderDetails.username} data-ai-hint="person user"/>
                          <AvatarFallback>{senderDetails.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                      </Link>
                  )}
                   {isCurrentUserSender && !senderDetails && ( // Fallback for own message if profile hasn't loaded yet
                      <div className="h-7 w-7 shrink-0" />
                   )}
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-md",
                      isCurrentUserSender
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                    {msg.mediaUrl && msg.mediaType === 'image' && (
                      <img src={msg.mediaUrl} alt="Sent media" className="mt-2 rounded-md max-w-xs max-h-48" data-ai-hint="chat media" />
                    )}
                    {msg.mediaUrl && msg.mediaType === 'video' && (
                      <video src={msg.mediaUrl} controls className="mt-2 rounded-md max-w-xs max-h-48" data-ai-hint="chat media video" />
                    )}
                    <p className={cn("text-xs mt-1", isCurrentUserSender ? "text-primary-foreground/70" : "text-muted-foreground/70", isCurrentUserSender ? "text-right" : "text-left")}>
 {msg.timestamp instanceof Timestamp
 ? formatTimeAgo(msg.timestamp)
 : msg.timestamp
 ? formatTimeAgo(new Date(msg.timestamp as string) as any) // Attempt conversion if not Timestamp
 : 'Invalid date'}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>

          {selectedFileName && (
            <div className="p-3 border-t text-sm text-muted-foreground flex justify-between items-center bg-card">
              <span>Attached: {selectedFileName}</span>
              <Button variant="ghost" size="icon" onClick={clearSelectedMedia} className="h-7 w-7">
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          <CardFooter className="p-3 border-t sticky bottom-0 bg-card">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow rounded-full py-2.5 px-4 h-auto text-sm"
                autoComplete="off"
                disabled={!conversationId || isLoadingMessages}
              />
              <input
                type="file"
                ref={mediaInputRef}
                onChange={handleMediaFileChange}
                className="hidden"
                accept="image/*,video/*"
                disabled={!conversationId || isLoadingMessages}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => mediaInputRef.current?.click()}
                disabled={!conversationId || isLoadingMessages}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full h-10 w-10 bg-accent hover:bg-accent/80" 
                disabled={(!newMessage.trim() && !selectedFile) || !conversationId || isLoadingMessages}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will delete messages for both users. (Simulated for now)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                handleDeleteConfirmed();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
