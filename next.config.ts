import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Fabric.js configuration for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }
    
    return config;
  },
  // Remove experimental.esmExternals for Turbopack compatibility
  transpilePackages: ['fabric'],
};

export default nextConfig;
