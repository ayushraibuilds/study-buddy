import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@study-buddy/api-client",
    "@study-buddy/contracts",
    "@study-buddy/design-tokens",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
