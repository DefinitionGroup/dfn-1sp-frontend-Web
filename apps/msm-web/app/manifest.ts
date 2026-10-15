import type { MetadataRoute } from "next";

// Favicon, icon.svg and apple-icon.png sit next to this file as Next.js metadata files.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MSM.digital",
    short_name: "MSM.digital",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
