
// src/app/(app)/settings/favorites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import type { Post } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, ListChecks, ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { db, doc, getDoc, collection, getDocs, query, Timestamp } from '@/lib/firebase';

export default function FavoritesPage() {
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { authUserId } = useSidebarContext();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!authUserId) {
        setError("Please log in to see your favorite posts.");
        setIsLoading(false);
        return;
      }
      if (!db) {
        setError("Database not available.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const bookmarksRef = collection(db, 'users', authUserId, 'bookmarks');
        const q = query(bookmarksRef);
        const querySnapshot = await getDocs(q);
        const savedPostIds = querySnapshot.docs.map(doc => doc.id);
        
        if (savedPostIds.length > 0) {
            const postPromises = savedPostIds.map(id => getDoc(doc(db, 'posts', id)));
            const postDocs = await Promise.all(postPromises);

            const resolvedPosts = postDocs
                .filter(docSnap => docSnap.exists())
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Post))
                .sort((a, b) => (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis());
            
            setFavoritePosts(resolvedPosts);
        } else {
           setFavoritePosts([]);
        }

      } catch (e) {
        console.error("Error fetching favorite posts:", e);
        setError("Could not load your favorite posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [authUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
            <Bookmark className="mr-3 h-7 w-7 text-primary fill-primary" />
            Your Favorite Posts
          </CardTitle>
           <div className="h-9 w-9 ml-2"></div>
        </CardHeader>
        <CardContent>
          {error && (
             <div className="text-center py-10 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p>{error}</p>
             </div>
          )}
          {!error && favoritePosts.length > 0 && (
            <UserPostGrid posts={favoritePosts} />
          )}
          {!error && !isLoading && favoritePosts.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Bookmark className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">You haven't saved any posts yet.</p>
              <p className="text-sm">Click the bookmark icon on a post to save it here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
