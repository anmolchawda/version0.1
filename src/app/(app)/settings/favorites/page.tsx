
// src/app/(app)/settings/favorites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPostGrid } from '@/components/profile/user-post-grid'; // Import UserPostGrid
import { getPlaceholderPostById } from '@/lib/placeholders';
import type { Post } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ListChecks, ChevronLeft } from 'lucide-react';

const MOCK_USER_ID = '1'; // Simulate a logged-in user

export default function FavoritesPage() {
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        <CardHeader className="relative flex flex-row items-center pt-4 pb-4 pr-4 pl-2 sm:pl-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 mr-2"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          <CardTitle className="text-2xl font-bold text-primary flex items-center flex-grow justify-center">
            <Heart className="mr-3 h-7 w-7 text-red-500 fill-red-500" />
            Your Favorite Posts
          </CardTitle>
           {/* Spacer to help center title if back button takes space, or remove if not needed */}
           <div className="h-9 w-9 ml-2"></div>
        </CardHeader>
        <CardContent>
          {favoritePosts.length > 0 ? (
            // Use UserPostGrid to display posts in a grid
            <UserPostGrid posts={favoritePosts} />
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

