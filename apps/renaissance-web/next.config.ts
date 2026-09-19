import type { NextConfig } from "next";
import path from "node:path";
import legacyRedirects from "./data/legacyRedirects.json";
import { renaissanceDeploymentHeaders } from "./lib/deployment";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
    // Local Studio and Renaissance share localhost and separate preview sessions.
    multiZoneDraftMode: process.env.NODE_ENV === "development",
  },
  // Pin Turbopack to this pnpm workspace so it can resolve the RENAISSANCE app and
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
  headers: () => renaissanceDeploymentHeaders(),
  redirects: async () => legacyRedirects.map(route => ({...route, permanent: true})),

};

export default nextConfig;
