import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Build ──────────────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },

  // ── Gambar — izinkan dari backend (localhost:3001) dan Supabase Storage ─
  images: {
    remotePatterns: [
      // File upload lokal dari NestJS backend (development)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      // File upload via Cloudflare Tunnel (production)
      {
        protocol: "https",
        hostname: "api.naz-ahtamir.site",
        pathname: "/uploads/**",
      },
      // File upload cloud dari Supabase Storage
      {
        protocol: "https",
        hostname: "aebbnztbxhxunpdfyscu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ── Rewrites — proxy /api/backend/* → NestJS (opsional, berguna saat deploy) ─
  async rewrites() {
    // Digunakan saat production jika BACKEND_API_URL diset
    const backendUrl = process.env.BACKEND_API_URL;
    if (backendUrl) {
      return [
        {
          source: "/api/backend/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },

  // ── Headers — CORS untuk API route internal Next.js ────────────────────
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
