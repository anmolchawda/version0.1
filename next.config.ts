import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

nextConfig.headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*', // Allow all origins
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
      ],
    },
  ];
};

module.exports = nextConfig;
