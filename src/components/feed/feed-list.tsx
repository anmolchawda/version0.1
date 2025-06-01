
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Post } from '@/types';
import { PostCard } from './post-card';
import { placeholderPosts as initialPosts } from '@/lib/placeholders';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PULL_THRESHOLD = 70; // Pixels to pull down to trigger refresh
const MAX_PULL_VISUAL_EFFECT_DISTANCE = 100; // Max distance for visual effect (e.g., icon movement)

export function FeedList() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDeltaY, setPullDeltaY] = useState(0);
  // isEligibleToPull is true if the page is scrolled to the top
  const [isEligibleToPull, setIsEligibleToPull] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to determine if pull-to-refresh can be initiated
  useEffect(() => {
    const checkScrollPosition = () => {
      const atTop = window.scrollY === 0;
      setIsEligibleToPull(atTop);
    };

    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition(); // Initial check

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);


  const handleRefresh = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPosts = [...posts].sort(() => Math.random() - 0.5);
    setPosts(newPosts);
    setIsLoading(false);
  }, [isLoading, posts]);

  useEffect(() => {
    setPosts(initialPosts);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLoading || !isEligibleToPull) {
      setPullStartY(null); // Ensure not to start a pull if not eligible or already loading
      return;
    }
    setPullStartY(e.touches[0].clientY);
    setPullDeltaY(0); // Reset delta on new touch start
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === null || isLoading) return;

    const currentY = e.touches[0].clientY;
    let delta = currentY - pullStartY;

    if (delta < 0) delta = 0; // Only allow pulling down

    setPullDeltaY(delta);

    // Basic prevention of scrolling while actively pulling down beyond a small threshold.
    // This is a sensitive area; aggressive preventDefault can break native scroll.
    if (delta > 10 && isEligibleToPull) {
      // e.preventDefault(); // Be cautious with this, might over-prevent. Test thoroughly.
    }
  };

  const handleTouchEnd = () => {
    if (pullStartY === null || isLoading) return;

    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    }
    
    setPullStartY(null);
    setPullDeltaY(0);
  };

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
      className="relative" // Needed for positioning the pull indicator correctly if it's a child
    >
      {/* Pull-to-refresh visual indicator */}
      <div
        className={cn(
          "fixed top-16 left-1/2 -translate-x-1/2 z-10 mt-3 p-2.5 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 ease-out",
          (pullDeltaY > 10 || (isLoading && pullStartY === null)) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          transform: `translateX(-50%) translateY(${Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px) scale(${ (pullDeltaY > 10 || (isLoading && pullStartY === null)) ? 1 : 0.75 })`,
        }}
      >
        {isLoading && pullStartY === null ? ( // Show loader when refreshing was triggered by pull (pullStartY is reset)
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : pullDeltaY > PULL_THRESHOLD ? ( // Pulled enough to trigger
          <RefreshCw className="h-5 w-5 text-green-500" />
        ) : pullDeltaY > 10 ? ( // Pulling in progress
          <RefreshCw 
            className="h-5 w-5 text-primary transition-transform duration-100" 
            style={{ transform: `rotate(${Math.min(pullDeltaY / PULL_THRESHOLD, 1) * 270}deg)`}}
          />
        ) : null}
      </div>
      
      <div 
        className="space-y-6 max-w-xl mx-auto transition-transform duration-200 ease-out"
        style={{
          // Push content down slightly when loading is active *after* a pull
          transform: (isLoading && pullStartY === null) ? `translateY(40px)` : 'translateY(0px)',
          paddingTop: '1px' // Ensures the touch area is available even if no posts
        }}
      >
        {posts.length === 0 && !isLoading && (
          <div className="text-center py-10 pt-20"> {/* Added padding top to avoid overlap with indicator */}
            <p className="text-xl text-muted-foreground">No posts yet. Follow some farmers to see their updates!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
