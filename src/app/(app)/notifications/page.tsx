// src/app/(app)/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2, ListChecks, ThumbsUp, MessageSquare, UserPlus, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { auth, db, collection, query, orderBy, onSnapshot, writeBatch, doc, Timestamp, getDocs } from '@/lib/firebase';
import type { Notification as NotificationType, ActorInfo } from '@/types';
import { getPlaceholderUser, formatTimeAgo } from '@/lib/placeholders';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { useToast } from '@/hooks/use-toast';
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
import { useTranslations } from '@/hooks/useTranslations';


function NotificationItem({ notification }: { notification: NotificationType }) {
  const { t } = useTranslations();
  const { actor, type, postImageUrl, postId, commentText, timestamp, read } = notification;
  // Ensure timestamp is a Timestamp object before passing to formatTimeAgo
  const timeAgo = timestamp instanceof Timestamp ? formatTimeAgo(timestamp) : 'Invalid date';

  const actorDetails = getPlaceholderUser(actor.id) || actor;

  let message = '';
  let link = `/profile/${actor.id}`;
  let actionIcon = <UserPlus className="h-5 w-5 text-blue-500" />;

  switch (type) {
    case 'like':
      message = `${actorDetails.name || actorDetails.username} ${t('likedYourPostText') || 'liked your post.'}`;
      if (postId) link = `/post/${postId}`;
      actionIcon = <ThumbsUp className="h-5 w-5 text-pink-500" />;
      break;
    case 'comment':
      message = `${actorDetails.name || actorDetails.username} ${t('commentedOnYourPostText') || 'commented:'} "${commentText ? (commentText.length > 50 ? commentText.substring(0, 47) + '...' : commentText) : t('onYourPostText') || 'on your post.'}"`;
      if (postId) link = `/post/${postId}#comments`;
      actionIcon = <MessageSquare className="h-5 w-5 text-green-500" />;
      break;
    case 'follow':
      message = `${actorDetails.name || actorDetails.username} ${t('startedFollowingYouText') || 'started following you.'}`;
      actionIcon = <UserPlus className="h-5 w-5 text-purple-500" />;
      break;
    default:
      message = t('newNotificationText') || 'New notification.';
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
  const { toast } = useToast();
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    if (!db || !authUserId) {
      console.log("[NotificationsPage] Mock mode or no authUserId. Skipping Firestore listener for notifications.");
      setNotifications([]);
      setIsLoading(false);
      setNotificationCount(0);
      return;
    }

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications', authUserId, 'items');
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

      // If there are unread notifications, mark them as read in a batch
      if (unreadNotificationIds.length > 0) {
        const batch = writeBatch(db);
        unreadNotificationIds.forEach(id => {
          const notifDocRef = doc(db, 'notifications', authUserId, 'items', id);
          batch.update(notifDocRef, { read: true });
        });
        
        try {
          await batch.commit();
          // The listener in TopHeader will automatically update the count
        } catch (e) {
          console.error("Error marking notifications as read:", e);
        }
      }
      
      // Also ensure context count is zero since we are on the page
      setNotificationCount(0);

    }, (err) => {
      console.error("Error fetching notifications:", err);
      setError(t('failedToLoadNotificationsError'));
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [authUserId, setNotificationCount, t]);

  const handleClearAllNotifications = async () => {
    if (isClearing) return;
    setIsClearing(true);

    if (!db || !authUserId) {
      setNotifications([]);
      setNotificationCount(0);
      toast({ title: t('toastNotificationsClearedMockTitle'), description: t('toastNotificationsClearedMockDescription') });
      setIsClearing(false);
      setShowClearConfirmDialog(false);
      return;
    }

    try {
      const notificationsRef = collection(db, 'notifications', authUserId, 'items');
      const querySnapshot = await getDocs(notificationsRef);
      
      if (querySnapshot.empty) {
        toast({ title: t('toastNoNotificationsToClearTitle'), description: t('toastNoNotificationsToClearDescription') });
        setIsClearing(false);
        setShowClearConfirmDialog(false);
        return;
      }

      const batch = writeBatch(db);
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      
      setNotifications([]); 
      setNotificationCount(0);
      toast({ title: t('toastNotificationsClearedTitle'), description: t('toastNotificationsClearedDescription') });

    } catch (e) {
      console.error("Error clearing notifications:", e);
      toast({ title: t('toastErrorClearingNotificationsTitle'), description: t('toastErrorClearingNotificationsDescription'), variant: "destructive" });
    } finally {
      setIsClearing(false);
      setShowClearConfirmDialog(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">{t('loadingNotificationsText')}</p>
      </div>
    );
  }
  
  if (!authUserId && !isLoading) { 
    return (
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-primary">
              <BellRing className="mr-3 h-7 w-7" />
              {t('notificationsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">{t('loginToViewNotificationsText')}</p>
            <Button asChild className="mt-4">
              <Link href="/login">{t('loginButtonText')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">{t('errorToastTitle')}</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl font-bold text-primary">
                <BellRing className="mr-3 h-7 w-7" />
                {t('notificationsTitle')}
              </CardTitle>
              <CardDescription>
                Your new updates and alerts from KrishiX.
              </CardDescription>
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowClearConfirmDialog(true)}
                disabled={isClearing}
              >
                {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4 text-destructive" />}
                {t('clearAllButton')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border max-h-[calc(100vh-15rem)] overflow-y-auto">
                {notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <ListChecks className="mx-auto h-16 w-16 mb-4 text-gray-400" />
                <p className="text-xl font-semibold">{t('allCaughtUpTitle')}</p>
                <p className="text-sm mt-1">{t('noNewNotificationsText')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showClearConfirmDialog} onOpenChange={setShowClearConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmClearAllTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmClearAllDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearConfirmDialog(false)}>{t('cancelButtonText')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllNotifications}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('clearAllConfirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
