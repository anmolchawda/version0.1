'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is the component for the "/" route within the authenticated app.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the feed.
    router.replace('/feed');
  }, [router]);

  // Render a loader while redirecting
  return (
     <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to your feed...</p>
      </div>
  );
}
