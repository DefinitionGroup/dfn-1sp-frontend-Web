import type { NextConfig } from "next";
import { getDeploymentHeaders } from "@1sp/utils/deployment-tier";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    "@1sp/site-config",
    "@1sp/sanity-types",
    "@1sp/sanity-queries",
    "@1sp/pagebuilder-core",
    "@1sp/utils",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // Enable optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  headers: () => getDeploymentHeaders("msm"),

};

export default nextConfig;
