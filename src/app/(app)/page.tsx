// src/app/(app)/page.tsx
'use client';

import { FeedList } from '@/components/feed/feed-list';

export default function HomePage() {
  return (
    <div>
      {/* This page now renders the FeedList, making it the homepage. */}
      <FeedList />
    </div>
  );
}
