import { dictFor, isLang } from "./i18n/dict";

/** Message shown when a server call fails (usually the phone lost the hotspot/Wi-Fi). English by default. */
export const NETWORK_ERROR = dictFor("en").err.network;

/** The page language (set by the root layout), so this works from any client component without a hook. */
const networkError = () => {
  const l = typeof document !== "undefined" ? document.documentElement.lang : "en";
  return dictFor(isLang(l) ? l : "en").err.network;
};

/**
 * Runs a server action from the client without letting a network failure crash the page.
 * Server actions throw on the client when the request fails; unhandled, that shows Next's "Application error" screen.
 */
export async function safe<T>(fn: () => Promise<T>, onError: (msg: string) => void): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    onError(networkError());
    return undefined;
  }
}
