import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack inside this repository when a parent directory happens to
  // contain another lockfile. The value must be an absolute path.
  turbopack: {
    root: process.cwd(),
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
