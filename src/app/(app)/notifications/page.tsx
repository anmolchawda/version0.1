
// src/app/(app)/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2, ListChecks, ThumbsUp, MessageSquare, UserPlus, ChevronRight } from "lucide-react";
import { auth, db, collection, query, orderBy, onSnapshot, writeBatch, doc, Timestamp, setDoc } from '@/lib/firebase'; // db can be null
import type { Notification as NotificationType, ActorInfo } from '@/types';
import { getPlaceholderUser, formatTimeAgo } from '@/lib/placeholders';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';

function NotificationItem({ notification }: { notification: NotificationType }) {
  const { actor, type, postImageUrl, postId, commentText, timestamp, read } = notification;
  // Ensure timestamp is a Date object before formatting
  const dateToFormat = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp as unknown as string);
  const timeAgo = formatTimeAgo(dateToFormat.toISOString());


  // Fetch actor details using placeholder for now
  // In a real app, this might come from a user context or a separate fetch
  const actorDetails = getPlaceholderUser(actor.id) || actor;

  let message = '';
  let link = `/profile/${actor.id}`;
  let actionIcon = <UserPlus className="h-5 w-5 text-blue-500" />;

  switch (type) {
    case 'like':
      message = `${actorDetails.name || actorDetails.username} liked your post.`;
      if (postId) link = `/post/${postId}`;
      actionIcon = <ThumbsUp className="h-5 w-5 text-pink-500" />;
      break;
    case 'comment':
      message = `${actorDetails.name || actorDetails.username} commented: "${commentText ? (commentText.length > 50 ? commentText.substring(0, 47) + '...' : commentText) : 'on your post.'}"`;
      if (postId) link = `/post/${postId}#comments`;
      actionIcon = <MessageSquare className="h-5 w-5 text-green-500" />;
      break;
    case 'follow':
      message = `${actorDetails.name || actorDetails.username} started following you.`;
      actionIcon = <UserPlus className="h-5 w-5 text-purple-500" />;
      break;
    default:
      message = 'New notification.';
  }

  return (
    <Link href={link} passHref>
      <div
        className={cn(
          "flex items-start space-x-3 p-3 hover:bg-muted/50 transition-colors rounded-lg",
          !read && "bg-primary/5 border border-primary/20"
        )}
      >
        <div className="mt-1 shrink-0">{actionIcon}</div>
        <Avatar className="h-10 w-10 border shrink-0">
          <AvatarImage src={actorDetails.avatarUrl} alt={actorDetails.username} data-ai-hint="person user" />
          <AvatarFallback>{actorDetails.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0">
          <p className="text-sm text-foreground whitespace-normal break-words">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {postImageUrl && (type === 'like' || type === 'comment') && (
          <div className="relative h-12 w-12 shrink-0 ml-2">
            <Image src={postImageUrl} alt="Post image" layout="fill" objectFit="cover" className="rounded-sm" data-ai-hint="farm post"/>
          </div>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground self-center shrink-0" />
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setNotificationCount, authUserId } = useSidebarContext();

  useEffect(() => {
    // If db is null (mock mode) or no authUserId, don't attempt Firebase operations
    if (!db || !authUserId) {
      console.log("[NotificationsPage] Mock mode or no authUserId. Skipping Firestore listener for notifications.");
      setNotifications([]); // Show no notifications in mock mode
      setIsLoading(false);
      setNotificationCount(0); // Clear badge in context
      return;
    }

    // Proceed with Firebase operations if db and authUserId are available
    setIsLoading(true);
    const notificationsRef = collection(db, 'users', authUserId, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedNotifications: NotificationType[] = [];
      const unreadNotificationIds: string[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<NotificationType, 'id'>;
        const notification = { id: docSnap.id, ...data } as NotificationType;
        fetchedNotifications.push(notification);
        if (!notification.read) {
          unreadNotificationIds.push(docSnap.id);
        }
      });
      
      setNotifications(fetchedNotifications);
      setIsLoading(false);

      if (unreadNotificationIds.length > 0) {
        const batch = writeBatch(db);
        unreadNotificationIds.forEach(id => {
          const notifDocRef = doc(db, 'users', authUserId, 'notifications', id);
          batch.update(notifDocRef, { read: true });
        });
        
        try {
          await batch.commit();
          const userNotificationsMetaRef = doc(db, 'notificationsMeta', authUserId);
          await setDoc(userNotificationsMetaRef, { unreadCount: 0 }, { merge: true });
          setNotificationCount(0);
        } catch (e) {
          console.error("Error marking notifications as read or updating meta:", e);
        }
      } else if (fetchedNotifications.length > 0) {
         const userNotificationsMetaRef = doc(db, 'notificationsMeta', authUserId);
         const docSnap = await getDoc(userNotificationsMetaRef);
         if(docSnap.exists() && docSnap.data()?.unreadCount !== 0) {
            await setDoc(userNotificationsMetaRef, { unreadCount: 0 }, { merge: true });
         }
         setNotificationCount(0);
      }

    }, (err) => {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [authUserId, setNotificationCount]); // db is stable, no need to include unless it can change

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading notifications...</p>
      </div>
    );
  }
  
  // Handle case where authUserId is null even after loading (should be caught by AppLayout, but as a safeguard)
  if (!authUserId && !isLoading) { 
    return (
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-primary">
              <BellRing className="mr-3 h-7 w-7" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">Please log in to view your notifications.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <p className="text-lg font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <BellRing className="mr-3 h-7 w-7" />
            Notifications
          </CardTitle>
          <CardDescription>
            Your latest updates and alerts from KrishiX.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ListChecks className="mx-auto h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-semibold">All caught up!</p>
              <p className="text-sm mt-1">You have no new notifications.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
