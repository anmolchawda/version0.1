// src/app/(app)/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now acts as a redirect to the canonical /feed URL.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/feed');
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to feed...</p>
    </div>
  );
}
