import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // hide Next.js dev badge on the demo phone
  serverExternalPackages: ["better-sqlite3"],
  // Ship the build-time seeded DB with the server bundle (Vercel demo build is read-only).
  outputFileTracingIncludes: { "/": ["./data/claims.db"] },
};

export default nextConfig;
