import raw from "../../../config/rules.config.json";
import type { RulesConfig } from "./engine";

// MOCK values; see config/rules.config.json.
export const rulesConfig = raw as unknown as RulesConfig;

// MOCK standard rejection reasons for the Finance audit screen.
export const rejectionReasons: string[] = raw.rejectionReasons;
