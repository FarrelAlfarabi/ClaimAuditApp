import type { MetadataRoute } from "next";

/** Lets the demo be added to the phone's home screen (full-screen, no browser bar). Not an offline app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Claim Audit (Demo)",
    short_name: "Claim Audit",
    description: "Ruangguru claim audit demo. MOCK data.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fd",
    theme_color: "#1d5bd8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
