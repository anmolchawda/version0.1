import type { Post } from '@/types';
import { PostCard } from './post-card';
import { placeholderPosts } from '@/lib/placeholders'; // Using placeholder data

export function FeedList() {
  // In a real app, posts would be fetched from an API
  const posts: Post[] = placeholderPosts;

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No posts yet. Follow some farmers to see their updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
