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
  // La API se sirve desde el mismo origen que el front: la cookie de sesion
  // deja de ser third-party (Safari/Firefox la bloqueaban) y los previews de
  // Vercel dejan de depender de que su URL este en el CORS del back.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
