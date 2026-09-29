"use client";

import type { AuditStatus } from "@/lib/db";
import { IconCheck, IconClock, IconX } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

const ICON = { pending: IconClock, approved: IconCheck, rejected: IconX };

/** Round outline pill with an icon: audit status, never confused with the square risk badge. */
export function StatusChip({ status }: { status: AuditStatus }) {
  const t = useT();
  const I = ICON[status];
  return <span className={`status status-${status}`}><I size={14} strokeWidth={2.6} />{t.status[status]}</span>;
}
