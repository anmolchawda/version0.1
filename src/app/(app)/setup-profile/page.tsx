
// src/app/(app)/setup-profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page is deprecated and redirects to the account settings page.
export default function DeprecatedSetupProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/account');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
