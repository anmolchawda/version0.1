
// src/app/(app)/settings/favorites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/feed/post-card';
import { placeholderPosts, getPlaceholderPostById } from '@/lib/placeholders';
import type { Post } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ListChecks } from 'lucide-react';

const MOCK_USER_ID = '1'; // Simulate a logged-in user

export default function FavoritesPage() {
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = () => {
      if (typeof window !== 'undefined') {
        const savedPostIdsString = localStorage.getItem(`farmdocc_saved_posts_${MOCK_USER_ID}`);
        const savedPostIds: string[] = savedPostIdsString ? JSON.parse(savedPostIdsString) : [];
        
        const resolvedPosts = savedPostIds
          .map(id => getPlaceholderPostById(id)) // Use the existing function to find posts
          .filter((post): post is Post => post !== undefined) // Type guard to filter out undefined
          .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by most recent

        setFavoritePosts(resolvedPosts);
      }
      setIsLoading(false);
    };

    fetchFavorites();

    // Optional: Listen for storage changes to update if another tab modifies favorites
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `farmdocc_saved_posts_${MOCK_USER_ID}`) {
        fetchFavorites();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <ListChecks className="h-8 w-8 animate-pulse text-primary" />
        <p className="ml-2 text-muted-foreground">Loading your favorite posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Heart className="mr-3 h-7 w-7 text-red-500 fill-red-500" />
            Your Favorite Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoritePosts.length > 0 ? (
            <div className="space-y-6">
              {favoritePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Heart className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">You haven't saved any posts yet.</p>
              <p className="text-sm">Click the bookmark icon on a post to save it here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
