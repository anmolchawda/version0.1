
// src/app/(app)/feed/page.tsx
'use client';

import { FeedList } from '@/components/feed/feed-list';

// =========================================================================
// === THE FIX IS HERE: `export default function ...`
// =========================================================================
// This is the correct way to define a Next.js page.
// It MUST be a default export.

export default function FeedPage() {
  return (
    // The page component itself doesn't need much styling.
    // It just acts as a container for the actual list component.
    <FeedList />
  );
}
