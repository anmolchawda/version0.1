
// src/app/(app)/post/[postId]/page.tsx
import { notFound } from 'next/navigation';
import { getPlaceholderPostById, getPlaceholderCommentsForPost } from '@/lib/placeholders';
import { PostDetailDisplay } from '@/components/post/post-detail-display';
import { CommentSection } from '@/components/comment/comment-section';
import type { Metadata, ResolvingMetadata } from 'next';
import React from 'react'; // Ensure React is imported

interface PostPageProps {
  params: { postId: string };
  searchParams?: { [key: string]: string | string[] | undefined }; // Explicitly include searchParams
}

export async function generateMetadata(
  { params, searchParams }: PostPageProps, // Destructure params and searchParams
  parent: ResolvingMetadata
): Promise<Metadata> {
  const postId = params.postId;
  const post = getPlaceholderPostById(postId);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Post by @${post.user.username}: ${post.caption.substring(0, 30)}... | KrishiX`,
    description: post.caption.substring(0, 150),
    openGraph: {
      title: `Post by @${post.user.username}`,
      description: post.caption,
      images: post.imageUrl ? [{ url: post.imageUrl, width: 800, height: 600, alt: post.caption.substring(0,50) }, ...previousImages] : previousImages,
    },
  };
}


export default async function PostPage({ params, searchParams }: PostPageProps) { // Destructure params and searchParams
  const postId = params.postId;
  const post = getPlaceholderPostById(postId);
  
  if (!post) {
    notFound();
  }

  // Example of how you might use searchParams if needed, though not currently used:
  // if (searchParams?.someQuery) {
  //   console.log("Query parameter found:", searchParams.someQuery);
  // }

  const comments = getPlaceholderCommentsForPost(postId);

  return (
    <div className="space-y-6">
      <PostDetailDisplay post={post} />
      <CommentSection postId={post.id} initialComments={comments} />
    </div>
  );
}

