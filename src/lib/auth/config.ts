/**
 * Login is on when Supabase is configured and not switched off.
 * Kill switch for the demo: AUTH_DISABLED=1 falls back to the no-login role switcher (e.g. if the hotspot has no internet).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const authEnabled = () => !!SUPABASE_URL && !!SUPABASE_KEY && process.env.AUTH_DISABLED !== "1";

/** Quick sign-in buttons on the login page (demo only). Password stays on the server. */
export const quickLoginEnabled = () => authEnabled() && process.env.DEMO_QUICK_LOGIN === "1" && !!process.env.DEMO_PASSWORD;

export const DEMO_ACCOUNTS = {
  finance: "finance.demo@example.com",
  employee: "employee.demo@example.com",
} as const;

/** Paths reachable without a session. */
export const PUBLIC_PATHS = ["/login", "/manifest.webmanifest", "/icon.svg", "/apple-icon.png", "/favicon.ico"];
export const isPublicPath = (p: string) =>
  PUBLIC_PATHS.includes(p) || p.startsWith("/_next/") || p.startsWith("/mock-receipts/") || p.startsWith("/icons/");
