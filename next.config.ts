import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "https://stratos.yogeshwaran.space",
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "https://stratos.yogeshwaran.space";
    const cleanBackend = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${cleanBackend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
