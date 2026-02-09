import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type check is done separately via tsc
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
