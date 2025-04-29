import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the 'output: export' for Vercel deployment
  images: {
    domains: ['localhost'], // Allow image optimization
  },
  eslint: {
    // Ignore ESLint errors during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
