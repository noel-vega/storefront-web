const CART_TOKEN_STORAGE_KEY = "cartToken";

// Only ever called from Client Components, but guarded anyway since this
// module can still be evaluated during the server render of a page that
// imports it.
export function getStoredCartToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(CART_TOKEN_STORAGE_KEY) ?? undefined;
}

export function setStoredCartToken(token: string | undefined) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
  }
}
