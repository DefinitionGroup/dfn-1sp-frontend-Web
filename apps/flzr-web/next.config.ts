import type { NextConfig } from "next";
import path from "node:path";
import { getDeploymentHeaders } from "@1sp/utils/deployment-tier";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  // Pin Turbopack to this pnpm workspace so it can resolve the FLZR app and
  // linked workspace packages. Without this, an unrelated
  // /Users/martin/package-lock.json makes Next infer /Users/martin as the
  // workspace root and PostCSS tries to resolve Tailwind from /Users/martin/DEV.
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
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
  headers: () => getDeploymentHeaders("flzr"),

};

export default nextConfig;
