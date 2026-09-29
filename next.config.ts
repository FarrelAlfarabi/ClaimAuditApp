import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // hide Next.js dev badge on the demo phone
  // Receipt photos go through a server action; phone photos are resized on the phone first, this is the ceiling.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  serverExternalPackages: ["better-sqlite3"],
  // Ship the build-time seeded DB with the server bundle (Vercel demo build is read-only).
  outputFileTracingIncludes: { "/**": ["./data/claims.db", "./data/claims.seed.db"] },
};

export default nextConfig;
