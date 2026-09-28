import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Ship the build-time seeded DB with the server bundle (Vercel demo build is read-only).
  outputFileTracingIncludes: { "/": ["./data/claims.db"] },
};

export default nextConfig;
