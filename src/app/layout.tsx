import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claim Audit (Demo)",
  description: "Ruangguru Claim Audit App, demo prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
