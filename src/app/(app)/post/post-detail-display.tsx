
// src/components/post/post-detail-display.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/types';
import { Heart, MessageCircle, Send, Bookmark, CalendarDays, ChevronLeft } from 'lucide-react'; // Added ChevronLeft
import { formatTimeAgo } from '@/lib/placeholders';
import { ShareModal } from './share-modal';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations'; // Import the hook

interface PostDetailDisplayProps {
  post: Post;
}

const MOCK_USER_ID = '1'; // Simulate a logged-in user

export function PostDetailDisplay({ post }: PostDetailDisplayProps) {
  const timeAgo = formatTimeAgo(post.createdAt);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentPostUrl, setCurrentPostUrl] = useState('');
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter(); // Initialize router
  const { t } = useTranslations(); // Initialize the hook

  const getSavedPostsFromStorage = (): string[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`krishix_saved_posts_${MOCK_USER_ID}`);
    return saved ? JSON.parse(saved) : [];
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPostUrl(window.location.href);
      const savedPosts = getSavedPostsFromStorage();
      setIsSaved(savedPosts.includes(post.id));
    }
  }, [post.id]);

  const handleToggleSave = () => {
    const savedPosts = getSavedPostsFromStorage();
    let updatedSavedPosts: string[];

    if (savedPosts.includes(post.id)) {
      updatedSavedPosts = savedPosts.filter(id => id !== post.id);
      toast({ title: t('toastPostUnsavedTitle'), description: t('toastPostUnsavedDescription') });
    } else {
      updatedSavedPosts = [...savedPosts, post.id];
      toast({ title: t('toastPostSavedTitle'), description: t('toastPostSavedDescription') });
    }
    localStorage.setItem(`krishix_saved_posts_${MOCK_USER_ID}`, JSON.stringify(updatedSavedPosts));
    setIsSaved(!isSaved);
  };


  return (
    <>
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center space-x-3 p-3 sm:p-4 bg-card border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label={t('backButton')}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-2 sm:space-x-3 flex-grow">
            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-primary">
              <AvatarImage src={post.user.avatarUrl || `https://placehold.co/44x44.png?text=${post.user.username.charAt(0)}`} alt={post.user.username} data-ai-hint="person farmer" />
              <AvatarFallback className="text-base sm:text-lg">{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <CardTitle className="text-sm sm:text-md font-semibold hover:underline truncate">{post.user.username}</CardTitle>
              {post.user.location && <p className="text-xs text-muted-foreground truncate">{post.user.location}</p>}
            </div>
          </Link>
          {/* Optional: Add a More Options button here if needed in the future */}
        </CardHeader>
        
        {post.imageUrl && (
          <div className="relative w-full bg-muted" style={{ aspectRatio: '1 / 1' }}>
            <Image
              src={post.imageUrl}
              alt={`Post by ${post.user.username}: ${post.caption.substring(0,50)}`}
              layout="fill"
              objectFit="cover"
              className="rounded-none"
              data-ai-hint="farm field crop"
              priority
            />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <p className="text-sm">{post.caption}</p>

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <Link href={`/discover?tag=${tag.replace('#', '')}`} key={tag}>
                  <Badge variant="secondary" className="text-primary hover:bg-primary/10 cursor-pointer py-1 px-2.5">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground pt-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {timeAgo}
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t flex flex-col items-start space-y-3">
          <div className="flex items-center space-x-2 w-full">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
              <Heart className="h-6 w-6" />
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">{t('commentAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/20" onClick={() => setIsShareModalOpen(true)}>
              <Send className="h-6 w-6" />
              <span className="sr-only">{t('shareAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto rounded-full hover:bg-accent/20" onClick={handleToggleSave}>
              <Bookmark className={`h-6 w-6 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              <span className="sr-only">{t('saveAction')}</span>
            </Button>
          </div>
          
          {post.likesCount > 0 && (
            <p className="text-sm font-semibold">{post.likesCount} {post.likesCount === 1 ? t('likeCountSingular') : t('likeCountPlural')}</p>
          )}
        </CardFooter>
      </Card>
      
      {currentPostUrl && (
        <ShareModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postUrl={currentPostUrl}
          postCaption={post.caption}
        />
      )}
    </>
  );
}
