"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeEmbeddedCheckoutShippingDetailsChangeEvent } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken } from "@/lib/cart-token";

type Config = { ready: boolean; stripeAccountId: string | null; cartEmpty: boolean };

export default function CheckoutPage() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const storefront = createStorefrontClient(getStoredCartToken());
    Promise.all([storefront.checkout.getConfig(), storefront.cart.get()]).then(
      ([checkoutConfig, cart]) => {
        setConfig({
          ready: checkoutConfig?.ready ?? false,
          stripeAccountId: checkoutConfig?.stripeAccountId ?? null,
          cartEmpty: !cart || cart.items.length === 0,
        });
      },
    );
  }, []);

  // scopes Stripe.js to this storefront's connected account — same
  // publishable key for every storefront, different stripeAccountId per tenant
  const stripePromise = useMemo(() => {
    if (!config?.ready || !config.stripeAccountId) return null;
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
      stripeAccount: config.stripeAccountId,
    });
  }, [config]);

  const fetchClientSecret = useCallback(async () => {
    const storefront = createStorefrontClient(getStoredCartToken());
    // createSession throws ApiError with the server's real message on
    // failure — no need to check for a falsy session
    const session = await storefront.checkout.createSession({
      returnUrl: `${window.location.origin}/checkout/return`,
    });
    return session.clientSecret;
  }, []);

  // called once the customer finishes entering their shipping address,
  // before they can pay — turns the placeholder "Calculating…" shipping
  // option into real carrier rates
  const onShippingDetailsChange = useCallback(
    async (event: StripeEmbeddedCheckoutShippingDetailsChangeEvent) => {
      const storefront = createStorefrontClient(getStoredCartToken());
      const { name, address } = event.shippingDetails;
      const result = await storefront.checkout.getShippingOptions({
        checkoutSessionId: event.checkoutSessionId,
        shippingDetails: {
          name,
          address: {
            country: address.country,
            line1: address.line1 ?? undefined,
            line2: address.line2 ?? undefined,
            city: address.city ?? undefined,
            postal_code: address.postal_code ?? undefined,
            state: address.state ?? undefined,
          },
        },
      });
      if (!result?.ok) {
        return {
          type: "reject" as const,
          errorMessage:
            result?.errorMessage ?? "We can't calculate shipping to that address",
        };
      }
      return { type: "accept" as const };
    },
    [],
  );

  if (!config) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
        Loading…
      </div>
    );
  }

  if (!config.ready || !stripePromise) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Checkout unavailable</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          This store isn&apos;t set up to accept payments yet.
        </p>
        <Link
          href="/cart"
          className="mt-4 inline-block text-sm text-black/60 hover:underline dark:text-white/60"
        >
          ← Back to cart
        </Link>
      </div>
    );
  }

  if (config.cartEmpty) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-black/60 hover:underline dark:text-white/60"
        >
          ← Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret, onShippingDetailsChange }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
