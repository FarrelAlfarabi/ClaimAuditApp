import { deleteSetting, getSetting, putSetting } from "./store";
import { rulesConfig } from "./rules/config";
import type { RulesConfig } from "./rules/engine";

/** The part of the rules Finance can change from the Settings screen. */
export type EditableRules = Pick<RulesConfig, "categoryLimits" | "nearLimitPct" | "workingHours">;

const KEY = "rules_override";

/** File defaults (config/rules.config.json) with any Settings-screen changes on top. */
export async function getEffectiveConfig(): Promise<RulesConfig> {
  const o = await getSetting<EditableRules>(KEY);
  if (!o) return rulesConfig;
  return {
    ...rulesConfig,
    categoryLimits: { ...rulesConfig.categoryLimits, ...o.categoryLimits },
    nearLimitPct: o.nearLimitPct,
    workingHours: o.workingHours,
  };
}

export const isCustomized = async () => (await getSetting(KEY)) !== undefined;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Returns field errors, or null if valid. Shared by the server action (source of truth) and the form. */
export function validateRules(r: EditableRules): Record<string, string> | null {
  const e: Record<string, string> = {};
  for (const [cat, v] of Object.entries(r.categoryLimits)) {
    if (!(cat in rulesConfig.categoryLimits)) e[`limit.${cat}`] = "Unknown category";
    else if (!Number.isInteger(v) || v < 1000 || v > 1_000_000_000) e[`limit.${cat}`] = "Enter a whole amount between Rp 1.000 and Rp 1.000.000.000";
  }
  if (!(r.nearLimitPct >= 0.5 && r.nearLimitPct <= 1)) e.nearLimitPct = "Enter a percentage between 50 and 100";
  if (!HHMM.test(r.workingHours.start)) e.start = "Use HH:MM (24-hour)";
  if (!HHMM.test(r.workingHours.end)) e.end = "Use HH:MM (24-hour)";
  if (!e.start && !e.end && r.workingHours.start >= r.workingHours.end) e.end = "End must be after start";
  return Object.keys(e).length ? e : null;
}

export async function saveRules(r: EditableRules) {
  await putSetting(KEY, r);
}

export async function resetRules() {
  await deleteSetting(KEY);
}
