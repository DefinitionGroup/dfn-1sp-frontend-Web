import type { NextConfig } from "next";
import path from "node:path";
import { studioco2DeploymentHeaders } from "./lib/deployment";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  // Pin Turbopack to the pnpm workspace so linked packages and Tailwind
  // resolve from the repository, not from a stray lockfile higher up.
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  transpilePackages: ["@1sp/site-config", "@1sp/utils"],
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  headers: () => studioco2DeploymentHeaders(),
};

export default nextConfig;
