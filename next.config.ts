import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gvcdxpshrdrvaisgjisu.supabase.co',
        pathname: '/storage/v1/object/public/media-content/**',
      },
    ],
  },
};

export default nextConfig;
