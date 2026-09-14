import { StorefrontClient } from "@ordersail/storefront-sdk";
import { getStoredRefreshToken, setStoredRefreshToken } from "@/lib/auth-token";

// A fresh instance per call is fine — cart/checkout state lives on
// `cartToken` (passed in explicitly), customer auth on `refreshToken`
// (restored here, persisted back via onTokensChanged), not anything else on
// the client. Safe to call from Server Components too: getStoredRefreshToken
// returns undefined server-side, and onTokensChanged only ever fires from
// signUp/signIn/refreshAccessToken/logout, none of which run during a plain
// catalog read.
export function createStorefrontClient(cartToken?: string) {
  return new StorefrontClient(
    process.env.NEXT_PUBLIC_STOREFRONT_API_URL!,
    process.env.NEXT_PUBLIC_APP_KEY!,
    cartToken,
    getStoredRefreshToken(),
    {
      onTokensChanged: ({ refreshToken }) => setStoredRefreshToken(refreshToken),
    },
  );
}
