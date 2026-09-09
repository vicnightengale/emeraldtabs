import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.elevenmusic.io",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
