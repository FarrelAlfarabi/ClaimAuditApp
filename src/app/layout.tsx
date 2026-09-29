import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { I18nProvider } from "@/components/i18n-provider";
import { getSessionUser } from "@/lib/role";
import { authEnabled } from "@/lib/auth/config";
import { getLang, getTheme } from "@/lib/i18n/server";
import "./globals.css";

// Self-hosted at build time, so the demo does not fetch fonts from Google at runtime.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "Claim Audit (Demo)",
  description: "Ruangguru Claim Audit App, demo prototype",
  appleWebApp: { capable: true, title: "Claim Audit", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141d31" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, lang, theme] = await Promise.all([getSessionUser(), getLang(), getTheme()]);
  return (
    <html lang={lang} data-theme={theme === "system" ? undefined : theme} className={jakarta.variable} suppressHydrationWarning>
      <body className="antialiased">
        <I18nProvider lang={lang}>
          <AppShell user={user} loginMode={authEnabled()} theme={theme}>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
