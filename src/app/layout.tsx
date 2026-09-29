import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { getRole } from "@/lib/role";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claim Audit (Demo)",
  description: "Ruangguru Claim Audit App, demo prototype",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const role = await getRole();
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell role={role}>{children}</AppShell>
      </body>
    </html>
  );
}
