import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing lint findings are tracked separately from the Pages deployment build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default nextConfig;
