// src/app/(app)/feed/page.tsx
'use client';

import { FeedList } from '@/components/feed/feed-list';

export default function FeedPage() {
  return (
    <div>
      {/* You can add a title here if you like, e.g., 
      <h1 className="text-2xl font-bold mb-6 text-primary text-center">Community Feed</h1> 
      */}
      <FeedList />
    </div>
  );
}
