import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for deployment to Vercel
  images: {
    unoptimized: true, // This is required for static exports with images
  },
};

export default nextConfig;
