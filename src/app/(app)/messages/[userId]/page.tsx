
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
import { auth, db, collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp, Timestamp, where, getDocs, limit } from '@/lib/firebase'; // Firebase imports

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const currentAuthUser = auth.currentUser;

  useEffect(() => {
    if (!currentAuthUser) {
      // This should ideally be handled by the AppLayout auth listener
      router.push('/login');
      return;
    }

    const partner = getPlaceholderUser(chatPartnerId);
    setChatPartner(partner); // Still using placeholder for partner's full details for now

    if (!partner) {
        setError("Chat partner not found.");
        setIsLoadingMessages(false);
        return;
    }

    const convId = getFirestoreConversationId(currentAuthUser.uid, chatPartnerId);
    setConversationId(convId);

    const messagesCollectionRef = collection(db, 'conversations', convId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreMessage;
        fetchedMessages.push({
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate().toISOString() : new Date().toISOString(),
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

    return () => unsubscribe();
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
       // Basic validation (can be expanded)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please select a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30) { // 30 second video limit
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
    if (!currentAuthUser || !conversationId) return;
    if (!newMessage.trim() && !selectedFile) return;

    const messageData: Omit<FirestoreMessage, 'id'> = {
      senderId: currentAuthUser.uid,
      text: newMessage.trim(),
      timestamp: serverTimestamp() as Timestamp, // Let Firestore set the server timestamp
    };

    // Placeholder for media upload - in a real app, upload file then get URL
    if (selectedFile) {
      messageData.mediaUrl = `mock-upload-path/${selectedFile.name}`; // Placeholder
      messageData.mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      // TODO: Implement actual file upload to Firebase Storage here
      // const storageRef = ref(storage, `chatMedia/${conversationId}/${selectedFile.name}`);
      // await uploadBytes(storageRef, selectedFile);
      // messageData.mediaUrl = await getDownloadURL(storageRef);
       toast({ title: "Media Upload (Simulated)", description: `${selectedFile.name} would be uploaded.`, duration: 2000 });
    }

    try {
      const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesCollectionRef, messageData);

      // Update conversation document
      const conversationDocRef = doc(db, 'conversations', conversationId);
      const currentUserDetails = getPlaceholderUser(currentAuthUser.uid) || { id: currentAuthUser.uid, username: currentAuthUser.email?.split('@')[0] || 'User', avatarUrl: currentAuthUser.photoURL || undefined, name: currentAuthUser.displayName || undefined };
      const chatPartnerDetails = chatPartner || { id: chatPartnerId, username: 'Partner', avatarUrl: undefined, name: 'Partner' };
      
      const conversationUpdateData: Partial<FirestoreConversation> = {
        participants: [currentAuthUser.uid, chatPartnerId].sort(),
        lastMessageText: messageData.text || (messageData.mediaType ? `${messageData.mediaType.charAt(0).toUpperCase() + messageData.mediaType.slice(1)} sent` : "Media sent"),
        lastMessageTimestamp: serverTimestamp() as Timestamp,
        lastMessageSenderId: currentAuthUser.uid,
        participantDetails: {
          [currentAuthUser.uid]: {
            id: currentUserDetails.id,
            username: currentUserDetails.username,
            name: currentUserDetails.name,
            avatarUrl: currentUserDetails.avatarUrl,
          },
          [chatPartnerId]: {
            id: chatPartnerDetails.id,
            username: chatPartnerDetails.username,
            name: chatPartnerDetails.name,
            avatarUrl: chatPartnerDetails.avatarUrl,
          }
        }
      };
      await setDoc(conversationDocRef, conversationUpdateData, { merge: true });

      setNewMessage('');
      clearSelectedMedia();
    } catch (err) {
      console.error("Error sending message: ", err);
      toast({ title: 'Error Sending Message', description: 'Please try again.', variant: 'destructive' });
    }
  };


  if (!currentAuthUser) { // Should be caught by AppLayout
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Authenticating...</p></div>;
  }
  if (!chatPartner && !isLoadingMessages && !error) { // Added !error here
    return <div className="flex items-center justify-center h-full"><p>Chat partner not found.</p></div>;
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
    // In a real app, you would call an API to delete the conversation here
    // e.g., deleteDoc(doc(db, 'conversations', conversationId));
    // This is a complex operation, as it might involve deleting all subcollection messages too.
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
            {!isLoadingMessages && error && (
              <div className="text-center text-destructive py-10">{error}</div>
            )}
            {!isLoadingMessages && !error && messages.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                No messages yet. Start the conversation!
              </div>
            )}
            {!isLoadingMessages && !error && messages.map((msg) => {
              const isCurrentUserSender = msg.senderId === currentAuthUser.uid;
              // For sender details, in a real app, fetch from a users collection. Using placeholder for now.
              const senderDetails = isCurrentUserSender ? getPlaceholderUser(currentAuthUser.uid) : chatPartner;
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
                      {formatTimeAgo(msg.timestamp)}
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
                disabled={!conversationId}
              />
              <input
                type="file"
                ref={mediaInputRef}
                onChange={handleMediaFileChange}
                className="hidden"
                accept="image/*,video/*"
                disabled={!conversationId}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => mediaInputRef.current?.click()}
                disabled={!conversationId}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full h-10 w-10 bg-accent hover:bg-accent/80" 
                disabled={(!newMessage.trim() && !selectedFile) || !conversationId}
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
