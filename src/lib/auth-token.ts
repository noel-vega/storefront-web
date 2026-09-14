const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
const REFRESH_TOKEN_CHANGED_EVENT = "refresh-token-changed";

// Only ever called from Client Components, but guarded anyway since this
// module can still be evaluated during the server render of a page that
// imports it (see createStorefrontClient in storefront.ts).
export function getStoredRefreshToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? undefined;
}

export function setStoredRefreshToken(token: string | undefined) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
  // the browser's own "storage" event never fires in the tab that made the
  // change — dispatch our own so same-tab subscribers (e.g. the nav's
  // signed-in indicator) can react too, not just other tabs
  window.dispatchEvent(new Event(REFRESH_TOKEN_CHANGED_EVENT));
}

// for useSyncExternalStore consumers — reacts to both same-tab changes (our
// own event, dispatched by setStoredRefreshToken above) and other-tab
// changes (the native "storage" event)
export function subscribeToRefreshTokenChanges(
  callback: () => void,
): () => void {
  window.addEventListener(REFRESH_TOKEN_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(REFRESH_TOKEN_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
