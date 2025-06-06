import type { NextConfig } from 'next';

const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'https://9003-firebase-studio-1748099875903.cluster-htdgsbmflbdmov5xrjithceibm.cloudworkstations.dev'
    ]
  }
};

module.exports = nextConfig;