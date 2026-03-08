import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize package imports — tree-shake barrel exports
  experimental: {
    optimizePackageImports: ['lucide-react', 'clsx'],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Faster builds
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
