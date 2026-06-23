import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "https://stratos.yogeshwaran.space",
  }
};

export default nextConfig;
