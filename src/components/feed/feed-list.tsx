
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Post as PostType, User } from '@/types';
import { PostCard } from '@/components/feed/post-card'; // Use absolute path
import { getPlaceholderUser, placeholderPosts as mockPlaceholderPosts } from '@/lib/placeholders'; // Renamed import
import { RefreshCw, Loader2, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase'; // db can be null
import { collection, getDocs, query, orderBy, Timestamp, type DocumentData, doc, getDoc } from 'firebase/firestore';
import { useTranslations } from '@/hooks/useTranslations';

const PULL_THRESHOLD = 70;
const MAX_PULL_VISUAL_EFFECT_DISTANCE = 100;
const WHEEL_PULL_ACTIVATION_THRESHOLD = 20;

const COMPONENT_USE_MOCK_DATA = db === null; // Determine mock mode based on db instance

export function FeedList() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial fetch
  const { t } = useTranslations();

  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDeltaY, setPullDeltaY] = useState(0);
  const [isEligibleToPull, setIsEligibleToPull] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);

  const fetchPostsFromFirestore = useCallback(async () => {
    console.log("[FeedList] Attempting to fetch posts from Firestore.");
    setIsLoading(true);

    try {
      if (!db) {
        throw new Error("Firestore db instance is not available.");
      }
      const postsCollectionRef = collection(db, 'posts');
      const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: PostType[] = [];
      const userCache: { [key: string]: User } = {}; // Cache for users

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as DocumentData;
        const userId = data.userId;

        // Fetch user from cache or Firestore
        let user = userCache[userId];

        if (!user) {
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            user = { id: userDocSnap.id, ...userDocSnap.data() as any };
            userCache[userId] = user;
          } else {
            console.warn(`User with ID ${userId} not found for post ${docSnap.id}. Skipping post.`);
            continue; // Skip post if user not found
          }
        }

        // At this point, user is guaranteed to be a User object
        fetchedPosts.push({
          userId: data.userId,
          id: docSnap.id,
          user: user, // TypeScript should now infer 'user' as User
          imageUrl: data.imageUrl,
          caption: data.caption || data.text || '',
          hashtags: data.hashtags || [],
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
          createdAt: data.createdAt as Timestamp || Timestamp.fromDate(new Date()),
        });
      }

      setPosts(fetchedPosts);
      console.log("[FeedList] Successfully fetched posts from Firestore:", fetchedPosts.length);
    } catch (error) {
      console.error("Error fetching posts from Firestore:", error);
    } finally {
      setIsLoading(false);
      setPullDeltaY(0);
    }
  }, [db]); // Dependency array

  const loadMockPosts = useCallback(() => {
    console.log("[FeedList] Loading mock posts.");
    setIsLoading(true);
    // Simulate async fetch for mock data
    setTimeout(() => {
      setPosts(mockPlaceholderPosts);
      setIsLoading(false);
      setPullDeltaY(0);
    }, 500);
  }, []);

  useEffect(() => {
    if (COMPONENT_USE_MOCK_DATA) {
      loadMockPosts();
    } else {
      fetchPostsFromFirestore();
    }

    const checkScrollPosition = () => {
      const newAtTop = window.scrollY === 0;
      // Only update state if the value actually changes
      setIsEligibleToPull(prev => {
        if (prev !== newAtTop) return newAtTop;
        return prev;
      });
    };
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition(); // Initial check
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [COMPONENT_USE_MOCK_DATA, fetchPostsFromFirestore, loadMockPosts]);


  const handleRefresh = useCallback(async () => { // Moved up the dependency array
    if (isLoading) return;
    if (COMPONENT_USE_MOCK_DATA) {
      loadMockPosts();
    } else {
      await fetchPostsFromFirestore();
    }
  }, [isLoading, COMPONENT_USE_MOCK_DATA, fetchPostsFromFirestore, loadMockPosts]);
  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLoading || !isEligibleToPull || e.touches.length === 0) { // Check against state variables
      setPullStartY(null);
      return;
    }
    setPullStartY(e.touches[0].clientY);
    setPullDeltaY(0); // Reset deltaY at the start of a new touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === null || isLoading || e.touches.length === 0) return; // Check against state variables
    const currentY = e.touches[0].clientY;
    let delta = currentY - pullStartY; // Use the state variable
    // Only allow positive delta (pulling down)
    if (delta < 0) delta = 0;
    setPullDeltaY(Math.min(delta, MAX_PULL_VISUAL_EFFECT_DISTANCE + 50)); // Cap visual effect
  };

  const handleTouchEnd = () => {
    if (pullStartY === null || isLoading) return;
    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    } else {
      // Smoothly animate back if not pulled enough
      setPullDeltaY(0);
    }
    setPullStartY(null);
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading || !isEligibleToPull || e.button !== 0) { // Only main (left) click
      setIsDragging(false); // Ensure dragging state is reset
      setPullStartY(null);
      return;
    }
    setIsDragging(true);
    setPullStartY(e.clientY);
    setPullDeltaY(0); // Reset deltaY at the start of a new drag
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
      // Clean up listeners even if conditions aren't met, just in case
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

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  const handleWheel = (e: React.WheelEvent) => {
    if (isLoading || !isEligibleToPull || e.ctrlKey || e.metaKey) return; // Avoid refresh on zoom etc.
    // Check if scrolling up at the very top
    if (e.deltaY < 0) {
      // Introduce a small buffer or threshold for wheel pull activation
      const pullStrength = -e.deltaY; // Make it positive
      if (pullStrength > WHEEL_PULL_ACTIVATION_THRESHOLD) { // Only trigger if significant upward scroll
        // Trigger refresh logic
        // To visually show something, we can briefly set pullDeltaY
        setPullDeltaY(PULL_THRESHOLD + 1); // Force it past threshold
        handleRefresh();
      }
    }
  };

  if (isLoading && posts.length === 0 && pullDeltaY === 0) { // Check against state variables
     return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">{t('loadingFeedText')}</p>
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
      {/* Pull-to-refresh indicator icon */}
      <div
        className={cn(
          "fixed top-16 left-1/2 -translate-x-1/2 z-10 mt-3 p-2.5 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 ease-out",
          (pullDeltaY > 10 || isLoading) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          transform: `translateX(-50%) translateY(${isLoading ? 0 : Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px) scale(${(pullDeltaY > 10 || isLoading) ? 1 : 0.75})`,
        }}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : pullDeltaY > PULL_THRESHOLD ? (
          <RefreshCw className="h-5 w-5 text-green-500" />
        ) : pullDeltaY > 10 ? (
          <RefreshCw
            className="h-5 w-5 text-primary transition-transform duration-100"
            style={{ transform: `rotate(${Math.min(pullDeltaY / PULL_THRESHOLD, 1) * 270}deg)` }}
          />
        ) : null}
      </div>

      {/* Posts List */}
      <div
        className="space-y-6 max-w-xl mx-auto transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${isLoading ? Math.max(40, pullDeltaY * 0.3) : Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px)`,
          paddingTop: '1px'
        }}
      >
        {posts.length === 0 && !isLoading && (
          <div
            className="text-center py-16"
            style={{ paddingTop: pullDeltaY > 0 ? `${Math.max(4, pullDeltaY * 0.3 / 16)}rem` : '4rem' }}
          >
            <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
            <p className="text-xl font-semibold text-muted-foreground">{t('noPostsYetTitle')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('noPostsYetDescription')}</p>
          </div>
        )}

        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} priority={index < 2} />
        ))}
      </div>
    </div>
  );
}

