import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from these external domains (Unsplash, Firebase Storage, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  // Silence noisy Turbopack multi-lockfile warning
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
