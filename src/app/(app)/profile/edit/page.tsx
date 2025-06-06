// src/app/(app)/profile/edit/page.tsx
'use client'; // notFound can be used in client components if called during render

import { notFound } from 'next/navigation';
import { useEffect } from 'react';

// This page is deprecated and should no longer be used.
// It has been replaced by /settings/account.
// Accessing this route will now explicitly trigger a 404.

export default function OldEditProfilePage() {
  useEffect(() => {
    notFound();
  }, []);

  // This return will likely not be reached due to notFound()
  // but is kept for structural completeness if notFound() behavior changes.
  return null; 
}
