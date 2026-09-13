import { StorefrontClient } from "@ordersail/storefront-sdk";

// A fresh instance per call is fine — cart/checkout state lives on
// `cartToken` (passed in explicitly), not anything else on the client.
export function createStorefrontClient(cartToken?: string) {
  return new StorefrontClient(
    process.env.NEXT_PUBLIC_STOREFRONT_API_URL!,
    process.env.NEXT_PUBLIC_APP_KEY!,
    cartToken,
  );
}
