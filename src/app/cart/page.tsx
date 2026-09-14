"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Cart } from "@ordersail/storefront-sdk";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken, setStoredCartToken } from "@/lib/cart-token";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const storefront = createStorefrontClient(getStoredCartToken());
      const result = await storefront.cart.get();
      setCart(result ?? null);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    createStorefrontClient(getStoredCartToken())
      .cart.get()
      .then((result) => {
        if (!ignore) setCart(result ?? null);
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function updateQuantity(variantId: number, quantity: number) {
    setActionError(null);
    try {
      const storefront = createStorefrontClient(getStoredCartToken());
      if (quantity <= 0) {
        await storefront.cart.removeItem(variantId);
      } else {
        await storefront.cart.updateItem(variantId, { quantity });
      }
      setStoredCartToken(storefront.cartToken);
      await refresh();
    } catch {
      setActionError("Couldn't update your cart — try again.");
    }
  }

  async function clear() {
    setActionError(null);
    try {
      const storefront = createStorefrontClient(getStoredCartToken());
      await storefront.cart.clear();
      setStoredCartToken(storefront.cartToken);
      await refresh();
    } catch {
      setActionError("Couldn't clear your cart — try again.");
    }
  }

  if (cart === undefined && !loadError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
        Loading…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Couldn&apos;t load your cart</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Something went wrong — try refreshing the page.
        </p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
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
      <h1 className="text-2xl font-medium">Cart</h1>
      {actionError ? (
        <p className="mt-2 text-sm text-red-600">{actionError}</p>
      ) : null}
      <ul className="mt-8 divide-y divide-black/10 dark:divide-white/15">
        {cart.items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              {item.optionValues.length > 0 ? (
                <p className="text-sm text-black/60 dark:text-white/60">
                  {item.optionValues.map((o) => o.value).join(" / ")}
                </p>
              ) : null}
              <p className="text-sm text-black/60 dark:text-white/60">
                {formatPrice(item.priceCents)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-black/10 dark:border-white/15"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="h-8 w-8 rounded-full border border-black/10 disabled:opacity-30 dark:border-white/15"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-medium">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6 dark:border-white/15">
        <button
          onClick={clear}
          className="text-sm text-black/60 hover:underline dark:text-white/60"
        >
          Clear cart
        </button>
        <p className="text-lg font-medium">
          Subtotal: {formatPrice(cart.subtotalCents)}
        </p>
      </div>
      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-foreground px-6 py-3 text-center text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Checkout
      </Link>
    </div>
  );
}
