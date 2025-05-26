// src/app/(app)/post/[postId]/page.tsx
import { notFound } from 'next/navigation';
import { getPlaceholderPostById, getPlaceholderCommentsForPost } from '@/lib/placeholders';
import { PostDetailDisplay } from '@/components/post/post-detail-display';
import { CommentSection } from '@/components/comment/comment-section';
import type { Metadata, ResolvingMetadata } from 'next';

interface PostPageProps {
  params: { postId: string };
}

export async function generateMetadata(
  { params: { postId } }: PostPageProps, // Destructured postId
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = getPlaceholderPostById(postId);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Post by @${post.user.username}: ${post.caption.substring(0, 30)}... | FARMDOCC`,
    description: post.caption.substring(0, 150),
    openGraph: {
      title: `Post by @${post.user.username}`,
      description: post.caption,
      images: post.imageUrl ? [{ url: post.imageUrl }, ...previousImages] : previousImages,
    },
  };
}


export default async function PostPage({ params: { postId } }: PostPageProps) { // Destructured postId
  const post = getPlaceholderPostById(postId);
  
  if (!post) {
    notFound();
  }

  const comments = getPlaceholderCommentsForPost(postId);

  return (
    <div className="space-y-6">
      <PostDetailDisplay post={post} />
      <CommentSection postId={post.id} initialComments={comments} />
    </div>
  );
}
