
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types';
import { Heart, MessageCircle } from 'lucide-react';

interface UserPostGridProps {
  posts: Post[];
}

export function UserPostGrid({ posts }: UserPostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">This farmer hasn't shared any posts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4 pt-8">
      {posts.map((post) => (
        <Link href={`/post/${post.id}#comments`} key={post.id} className="group relative aspect-square block w-full overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.caption.substring(0, 50) || 'User post'}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="farm crop"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted p-2">
              <p className="text-xs text-center text-muted-foreground line-clamp-3">{post.caption}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-2">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-1" /> {post.likesCount}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-1" /> {post.commentsCount}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
