
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
  const [isEligibleToPull, setIsEligibleToPull] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // To track mouse dragging specifically

  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollPosition = () => {
      const atTop = window.scrollY === 0;
      setIsEligibleToPull(atTop);
    };

    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition(); 

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPosts = [...posts].sort(() => Math.random() - 0.5);
    setPosts(newPosts);
    setIsLoading(false);
  }, [isLoading, posts]);

  useEffect(() => {
    setPosts(initialPosts);
  }, []);

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
    setPullDeltaY(delta);
  };

  const handleTouchEnd = () => {
    if (pullStartY === null || isLoading) return;
    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    }
    setPullStartY(null);
    setPullDeltaY(0);
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading || !isEligibleToPull || e.button !== 0) { // Only main (left) click
      setIsDragging(false);
      setPullStartY(null);
      return;
    }
    setIsDragging(true);
    setPullStartY(e.clientY);
    setPullDeltaY(0);
    
    // Add window listeners for mouse move and up
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging || pullStartY === null || isLoading) return;

    const currentY = e.clientY;
    let delta = currentY - pullStartY;
    if (delta < 0) delta = 0;
    setPullDeltaY(delta);
  };

  const handleWindowMouseUp = () => {
    if (!isDragging || pullStartY === null || isLoading) {
      // Clean up just in case, though isDragging should cover it
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      setIsDragging(false);
      setPullStartY(null);
      return;
    }

    if (pullDeltaY > PULL_THRESHOLD) {
      handleRefresh();
    }
    
    setIsDragging(false);
    setPullStartY(null);
    setPullDeltaY(0);

    // Clean up window listeners
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };
  
  // Cleanup effect for window listeners if component unmounts during a drag
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []); // Empty dependency array means this runs on mount and cleans up on unmount

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
      className="relative" 
      style={{ userSelect: isDragging ? 'none' : 'auto' }} // Prevent text selection during drag
    >
      <div
        className={cn(
          "fixed top-16 left-1/2 -translate-x-1/2 z-10 mt-3 p-2.5 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 ease-out",
          (pullDeltaY > 10 || (isLoading && (pullStartY === null || isDragging))) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          transform: `translateX(-50%) translateY(${Math.min(pullDeltaY, MAX_PULL_VISUAL_EFFECT_DISTANCE) * 0.3}px) scale(${ (pullDeltaY > 10 || (isLoading && (pullStartY === null || isDragging))) ? 1 : 0.75 })`,
        }}
      >
        {isLoading && (pullStartY === null || isDragging) ? 
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
          transform: (isLoading && (pullStartY === null || isDragging)) ? `translateY(40px)` : 'translateY(0px)',
          paddingTop: '1px' 
        }}
      >
        {posts.length === 0 && !isLoading && (
          <div className="text-center py-10 pt-20">
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
