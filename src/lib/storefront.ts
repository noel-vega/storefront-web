import { StorefrontClient } from "@ordersail/storefront-sdk";
import {
  getStoredRefreshToken,
  setStoredRefreshToken,
  subscribeToRefreshTokenChanges,
} from "@/lib/auth-token";
import { getStoredCartToken } from "@/lib/cart-token";

function newClient(refreshToken?: string) {
  return new StorefrontClient(
    process.env.NEXT_PUBLIC_STOREFRONT_API_URL!,
    process.env.NEXT_PUBLIC_APP_KEY!,
    undefined,
    refreshToken,
    {
      onTokensChanged: ({ refreshToken }) => setStoredRefreshToken(refreshToken),
    },
  );
}

let browserClient: StorefrontClient | undefined;
let lastSyncedCartToken: string | undefined;

// One client per browser tab, a fresh one per call on the server.
//
// Browser: refresh tokens are single-use, and a client restored from one
// refreshes on its first authenticated call. The SDK shares that refresh
// between concurrent calls on the *same* client, but two clients holding the
// same stored token would each redeem it — the second looks like reuse and
// revokes the session. So every browser call site shares this instance:
// signin/signup/logout, the account pages and the cart alike.
//
// Server: Server Components only read the catalog and never hold a session,
// and a module-level instance there would be shared across every visitor's
// request — so they always get a fresh one.
export function getStorefrontClient(): StorefrontClient {
  if (typeof window === "undefined") return newClient();

  if (!browserClient) {
    const client = newClient(getStoredRefreshToken());
    // Another tab that refreshes or signs out rotates the stored token; this
    // tab's copy would then be stale, and redeeming it trips reuse
    // detection. Follow storage instead. Our own writes land here too, via
    // onTokensChanged, and are no-ops.
    subscribeToRefreshTokenChanges(() => {
      const stored = getStoredRefreshToken();
      if (stored === client.refreshToken) return;
      client.refreshToken = stored;
      if (!stored) client.accessToken = undefined;
    });
    browserClient = client;
  }
  // Pick up cart-token changes made in storage (a cleared cart after
  // checkout, another tab) — but only when storage actually changed.
  // addItem() sets a new token on the client before its call site persists
  // it, and re-reading unchanged storage in that gap would clobber it.
  const storedCartToken = getStoredCartToken();
  if (storedCartToken !== lastSyncedCartToken) {
    browserClient.cartToken = storedCartToken;
    lastSyncedCartToken = storedCartToken;
  }
  return browserClient;
}
