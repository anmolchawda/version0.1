
'use client';

import { useState, useEffect } from 'react';
import type { Post } from '@/types';
import { PostCard } from './post-card';
import { placeholderPosts as initialPosts } from '@/lib/placeholders';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

export function FeedList() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate fetching new posts by shuffling the existing ones.
    // For a more noticeable change, we'll reverse the order for this example.
    // A real app would fetch new data from a server.
    const newPosts = [...posts].sort(() => Math.random() - 0.5); // Shuffle posts

    setPosts(newPosts);
    setIsLoading(false);
  };

  // Initialize posts on mount, in case initialPosts reference changes (though unlikely for placeholders)
  useEffect(() => {
    setPosts(initialPosts);
  }, []);


  if (isLoading && posts.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading feed...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex justify-center pt-4 mb-0">
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading} 
          variant="outline" 
          className="rounded-full px-6 py-2 shadow-sm hover:shadow-md transition-shadow"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Refreshing...' : 'Refresh Feed'}
        </Button>
      </div>

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No posts yet. Follow some farmers to see their updates!</p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
