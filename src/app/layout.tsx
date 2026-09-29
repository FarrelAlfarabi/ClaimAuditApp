import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/role";
import { authEnabled } from "@/lib/auth/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claim Audit (Demo)",
  description: "Ruangguru Claim Audit App, demo prototype",
  appleWebApp: { capable: true, title: "Claim Audit", statusBarStyle: "default" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#171717" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell user={user} loginMode={authEnabled()}>{children}</AppShell>
      </body>
    </html>
  );
}
