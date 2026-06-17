import type { NextConfig } from "next";

const backendUrl = process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:8080";
const imageDomain = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME || "localhost";
const supabaseImageHostname = (
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_HOSTNAME ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : "bmyghobfovkzchhuhnss.supabase.co")
).trim();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
        hostname: imageDomain,
        pathname: "/assets/**",
      },
      ...(supabaseImageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseImageHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: `${backendUrl}/assets/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/backend-admin/:path*",
        destination: `${backendUrl}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
