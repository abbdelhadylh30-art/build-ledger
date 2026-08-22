import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — produces an `out/` folder that can be served from anywhere
  // (file://, Tauri's tauri://localhost, GitHub Pages, etc.)
  output: "export",

  // Disable Next.js Image optimization — required for static export.
  // We don't use <Image> heavily anyway.
  images: {
    unoptimized: true,
  },

  // Add trailing slashes so static hosting works without server rewrites
  // (Tauri's webview serves files from disk, so /path/ → /path/index.html)
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
