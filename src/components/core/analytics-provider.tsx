// src/components/core/analytics-provider.tsx
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // This is a placeholder for analytics.
    // In a real app, you would integrate with an analytics service here.
    // For example, sending page views:
    // analyticsService.pageview(pathname);
    console.log(`Analytics: Page view - ${pathname}`);
  }, [pathname]);

  return null; // This component does not render anything
}
