
// src/components/feed/feed-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import Link from 'next/link';

// =========================================================================
// === FIX FOR ERROR #2 and #3: 'PostCard' and 'post' type
// =========================================================================
// We define the Post type and the PostCard component directly in this file
// to ensure they exist and are correctly typed.

// Define a type for your Post data to satisfy TypeScript
interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  caption: string;
  tags?: string[];
  createdAt: any; // Use 'any' for simplicity with Firestore Timestamps
}

// A complete, working PostCard component
const PostCard = ({ post }: { post: Post }) => {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={post.authorAvatar} />
          <AvatarFallback>{post.authorName?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <span className="ml-3 font-semibold text-sm">{post.authorName}</span>
      </div>

      {/* Post Image - takes up the remaining space */}
      <div className="relative flex-1 bg-gray-200">
        <Image
          src={post.imageUrl}
          alt={`Post by ${post.authorName}`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Post Actions & Footer */}
      <div className="p-3">
        <div className="flex items-center space-x-4 mb-2">
          <Heart className="h-6 w-6" />
          <MessageCircle className="h-6 w-6" />
          <Send className="h-6 w-6" />
          <div className="flex-1 text-right">
            <Bookmark className="h-6 w-6 inline-block" />
          </div>
        </div>
        <p className="text-sm">
          <span className="font-semibold">{post.authorName}</span> {post.caption}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {post.tags?.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <span className="text-xs text-blue-500 hover:underline">#{tag}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// === FIX FOR ERROR #1: 'use-feed'
// =========================================================================
// We replace the missing hook with actual Firestore data fetching logic.
export function FeedList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feed:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className="pt-24 text-center text-muted-foreground">No posts in the feed yet.</div>;
  }

  return (
    // This is the full-screen snap container
    <div className="h-full snap-y snap-mandatory -mx-4 md:-mx-6">
      {posts.map((post) => (
        // Each child is a snap point that fills the viewport height
        <div
          key={post.id}
          className="snap-start flex h-[calc(100vh-8rem)] w-full items-center justify-center"
        >
          <div className="h-full w-full max-w-2xl bg-white dark:bg-black">
            <PostCard post={post} />
          </div>
        </div>
      ))}
    </div>
  );
}
