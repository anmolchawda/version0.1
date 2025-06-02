
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Post as PostType, User } from '@/types';
import { PostCard } from './post-card';
import { getPlaceholderUser } from '@/lib/placeholders';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, type DocumentData } from 'firebase/firestore';

const PULL_THRESHOLD = 70;
const MAX_PULL_VISUAL_EFFECT_DISTANCE = 100;
const WHEEL_PULL_ACTIVATION_THRESHOLD = 20;

export function FeedList() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial fetch

  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDeltaY, setPullDeltaY] = useState(0);
  const [isEligibleToPull, setIsEligibleToPull] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);

  const fetchPostsFromFirestore = useCallback(async () => {
    setIsLoading(true); // Ensure loading is true at the start of fetch
    try {
      const postsCollectionRef = collection(db, 'posts');
      const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: PostType[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        const user = getPlaceholderUser(data.userId) as User; 

        if (user) { 
          fetchedPosts.push({
            id: docSnap.id,
            user: user,
            imageUrl: data.imageUrl,
            caption: data.caption || data.text || '',
            hashtags: data.hashtags || [],
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          });
        } else {
          console.warn(`User with ID ${data.userId} not found for post ${docSnap.id}`);
        }
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts from Firestore:", error);
      // setPosts([]); // Clear posts on error or show stale if desired
    } finally {
      setIsLoading(false);
      setPullDeltaY(0); // Reset pull delta after loading attempt
    }
  }, []);


  useEffect(() => {
    fetchPostsFromFirestore(); 
    
    const checkScrollPosition = () => {
      const atTop = window.scrollY === 0;
      setIsEligibleToPull(atTop);
    };
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition();
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [fetchPostsFromFirestore]);

  const handleRefresh = useCallback(async () => {
    if (isLoading) return;
    await fetchPostsFromFirestore();
  }, [isLoading, fetchPostsFromFirestore]);

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLoading || !isEligibleToPull || e.touches.length === 0) {
      setPullStartY(null);
      return;
    }
    setPullStartY(e.touches[0].clientY);
    setPullDeltaY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === null || isLoading || e.touches.length === 0) return;
    const currentY = e.touches[0].clientY;
    let delta = currentY - pullStartY;
    if (delta < 0) delta = 0; 
    setPullDeltaY(Math.min(delta, MAX_PULL_VISUAL_EFFECT_DISTANCE + 50));
  };

  const handleTouchEnd = () => {
    if (pullStartY === null || isLoading) return;
    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    } else {
      setPullDeltaY(0);
    }
    setPullStartY(null);
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading || !isEligibleToPull || e.button !== 0) {
      setIsDragging(false);
      setPullStartY(null);
      return;
    }
    setIsDragging(true);
    setPullStartY(e.clientY);
    setPullDeltaY(0);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging || pullStartY === null || isLoading) return;
    const currentY = e.clientY;
    let delta = currentY - pullStartY;
    if (delta < 0) delta = 0;
    setPullDeltaY(Math.min(delta, MAX_PULL_VISUAL_EFFECT_DISTANCE + 50));
  };

  const handleWindowMouseUp = () => {
    if (!isDragging || pullStartY === null || isLoading) {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      setIsDragging(false);
      setPullStartY(null);
      return;
    }
    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    } else {
      setPullDeltaY(0);
    }
    setIsDragging(false);
    setPullStartY(null);
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (isLoading || !isEligibleToPull || e.ctrlKey || e.metaKey) return;
    if (e.deltaY < 0) {
      const pullStrength = -e.deltaY;
      if (pullStrength > WHEEL_PULL_ACTIVATION_THRESHOLD) {
        setPullDeltaY(PULL_THRESHOLD + 1); 
        handleRefresh();
      }
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []); 

  if (isLoading && posts.length === 0 && pullDeltaY === 0) {
     return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading feed...</p>
      </div>
    );
  }

  return (
    <div 
      ref={feedContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      className="relative" 
      style={{ 
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <div
        className={cn(
          "fixed top-16 left-1/2 -translate-x-1/2 z-10 mt-3 p-2.5 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 ease-out",
          (pullDeltaY > 10 || isLoading) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          transform: `translateX(-50%) translateY(${isLoading ? 0 : Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px) scale(${ (pullDeltaY > 10 || isLoading) ? 1 : 0.75 })`,
        }}
      >
        {isLoading ? 
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
         : pullDeltaY > PULL_THRESHOLD ? 
          <RefreshCw className="h-5 w-5 text-green-500" />
         : pullDeltaY > 10 ? 
          <RefreshCw 
            className="h-5 w-5 text-primary transition-transform duration-100" 
            style={{ transform: `rotate(${Math.min(pullDeltaY / PULL_THRESHOLD, 1) * 270}deg)`}}
          />
         : null}
      </div>
      
      <div 
        className="space-y-6 max-w-xl mx-auto transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${isLoading ? Math.max(40, pullDeltaY * 0.3) : Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px)`,
          paddingTop: '1px' 
        }}
      >
        {posts.length === 0 && !isLoading && (
          <div 
            className="text-center py-10"
            style={{ paddingTop: pullDeltaY > 0 ? `${Math.max(2.5, pullDeltaY * 0.3 / 16)}rem` : '2.5rem' }}
          >
            <p className="text-xl text-muted-foreground">No posts yet. Follow some farmers to see their updates or check your Firestore 'posts' collection!</p>
          </div>
        )}

        {posts.map((post, index) => ( // Added index for priority
          <PostCard key={post.id} post={post} priority={index < 2} /> // Pass priority
        ))}
      </div>
    </div>
  );
}

