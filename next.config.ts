import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatares y fotos de alfajor/reseña se sirven desde Cloudinary.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
