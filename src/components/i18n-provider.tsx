"use client";

import { createContext, useContext } from "react";
import { dictFor, type Lang } from "@/lib/i18n/dict";

const LangContext = createContext<Lang>("en");

/** Only the language code crosses the server/client line; each client component looks up its own strings. */
export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = () => dictFor(useContext(LangContext));
