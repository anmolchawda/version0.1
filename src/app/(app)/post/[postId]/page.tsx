
'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostDetailDisplay } from '@/components/post/post-detail-display';
import { CommentSection } from '@/components/comment/comment-section';
import { db, doc, getDoc } from '@/lib/firebase';
import type { Post } from '@/types';
import { Loader2 } from 'lucide-react';

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    
    const fetchPost = async () => {
      if (!db) {
        setError("Database not available.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const postDocRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(postDocRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Failed to load post.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    // This will render a not found page for post not found, or an error message for other errors.
    notFound();
  }

  if (!post) {
    return null; // Should be caught by error state, but as a safeguard.
  }

  return (
    <div className="space-y-6">
      <PostDetailDisplay post={post} />
      <CommentSection postId={post.id} />
    </div>
  );
}
