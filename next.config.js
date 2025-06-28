// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // The experimental.allowedDevOrigins option has been removed
  // as it was deprecated in Next.js 14 and is not supported in Next.js 15.
  // Default CORS handling for development should suffice for most cases.
  // If specific CORS headers are needed, they can be configured via the headers() function.
};

module.exports = nextConfig;