import type { RiskLevel } from "@/lib/rules/engine";

/** Inline stroke icons (24 px grid). Decorative by default: pair them with visible text or an aria-label. */
type P = { size?: number; className?: string; strokeWidth?: number };

function Svg({ size = 20, className, strokeWidth = 2.2, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export const IconReceipt = (p: P) => <Svg {...p}><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z" /><path d="m9 11 2 2 4-4" /></Svg>;
export const IconSearch = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const IconFilter = (p: P) => <Svg {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></Svg>;
export const IconDownload = (p: P) => <Svg {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Svg>;
export const IconX = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IconCheck = (p: P) => <Svg {...p}><path d="m5 12 5 5 9-10" /></Svg>;
export const IconChevronRight = (p: P) => <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>;
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>;
export const IconChevronDown = (p: P) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const IconSignOut = (p: P) => <Svg {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M14 17l5-5-5-5M19 12H8" /></Svg>;
export const IconQueue = (p: P) => <Svg {...p}><path d="M4 6h16M4 12h16M4 18h10" /></Svg>;
export const IconTable = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 10h18M9 10v10" /></Svg>;
export const IconShield = (p: P) => <Svg {...p}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IconSparkle = (p: P) => <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Svg>;
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconList = (p: P) => <Svg {...p}><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z" /><path d="M9 8h6M9 12h6" /></Svg>;
export const IconCamera = (p: P) => <Svg {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></Svg>;
export const IconClock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const IconAlert = (p: P) => <Svg {...p}><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h0" /></Svg>;
export const IconAlertCircle = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h0" /></Svg>;
export const IconZoom = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></Svg>;
export const IconLock = (p: P) => <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
export const IconUndo = (p: P) => <Svg {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Svg>;
export const IconZap = (p: P) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Svg>;
export const IconRefresh = (p: P) => <Svg {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></Svg>;
export const IconGlobe = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Svg>;
export const IconMoon = (p: P) => <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></Svg>;

/** Risk strength bars: 3 filled = High, 2 = Medium, 1 = Low. Shape cue so risk never relies on colour alone. */
export function RiskBars({ risk, size = 12 }: { risk: RiskLevel; size?: number }) {
  const n = risk === "High" ? 3 : risk === "Medium" ? 2 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor" />
      <rect x="4.5" y="4" width="3" height="8" rx="1" fill="currentColor" opacity={n >= 2 ? 1 : 0.28} />
      <rect x="9" y="1" width="3" height="11" rx="1" fill="currentColor" opacity={n >= 3 ? 1 : 0.28} />
    </svg>
  );
}
