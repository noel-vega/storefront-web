import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // an unrelated package-lock.json in a parent directory (outside this repo)
  // otherwise makes Turbopack guess the wrong workspace root
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
