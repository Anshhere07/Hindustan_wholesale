import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow images from these external domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  // Fix Turbopack root to absolute path
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
