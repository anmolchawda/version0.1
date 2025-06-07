import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The experimental.allowedDevOrigins option has been removed
  // as it was deprecated in Next.js 14 and is not supported in Next.js 15.
  // Default CORS handling for development should suffice for most cases.
  // If specific CORS headers are needed, they can be configured via the headers() function.
};

module.exports = nextConfig;
