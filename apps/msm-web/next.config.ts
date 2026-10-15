import type { NextConfig } from "next";
import path from "node:path";
import { getDeploymentHeaders } from "@1sp/utils/deployment-tier";
import contentRedirects from './data/content-redirects.json';
import germanToEnglishRedirects from './data/de-to-en-redirects.json';

// Temporary while the German pages are unfinished: MSM_REDIRECT_DE_TO_EN=true
// (set on the production project only) sends every /de URL to its English
// page with a 307. Exact page pairs come first; legacy /de/project/* redirects
// then chain into them; anything left just drops the /de prefix.
const redirectGermanToEnglish = process.env.MSM_REDIRECT_DE_TO_EN === "true";

const nextConfig: NextConfig = {
  redirects: async () =>
    redirectGermanToEnglish
      ? [
          ...germanToEnglishRedirects,
          ...contentRedirects,
          { source: "/de/:path*", destination: "/:path*", permanent: false },
        ]
      : contentRedirects,
  // Keep development file watching inside this monorepo. An unrelated
  // lockfile above it otherwise makes Turbopack scan the entire home folder.
  turbopack: { root: path.resolve(__dirname, "../..") },
  experimental: {
    globalNotFound: true,
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
      {
        protocol: "https",
        hostname: "www.msm.digital",
        port: "",
        pathname: "/de/wp-content/uploads/**",
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
