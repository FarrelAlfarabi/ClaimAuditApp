/** Message shown when a server call fails (usually the phone lost the hotspot/Wi-Fi). */
export const NETWORK_ERROR = "Could not reach the server. Check the connection and try again. Nothing was saved.";

/**
 * Runs a server action from the client without letting a network failure crash the page.
 * Server actions throw on the client when the request fails; unhandled, that shows Next's "Application error" screen.
 */
export async function safe<T>(fn: () => Promise<T>, onError: (msg: string) => void): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    onError(NETWORK_ERROR);
    return undefined;
  }
}
