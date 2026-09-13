"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDetailVariant } from "@ordersail/storefront-sdk";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken, setStoredCartToken } from "@/lib/cart-token";
import { formatPrice } from "@/lib/format";

function variantLabel(variant: ProductDetailVariant): string {
  if (variant.optionValues.length === 0) return formatPrice(variant.priceCents);
  const options = variant.optionValues.map((o) => o.value).join(" / ");
  return `${options} — ${formatPrice(variant.priceCents)}`;
}

export function VariantPicker({
  variants,
}: {
  variants: ProductDetailVariant[];
}) {
  const router = useRouter();
  const inStock = variants.filter((v) => v.stock > 0);
  const [variantId, setVariantId] = useState<number | undefined>(
    inStock[0]?.id,
  );
  const [status, setStatus] = useState<"idle" | "adding" | "error">("idle");

  async function handleClick() {
    if (!variantId) return;
    setStatus("adding");
    try {
      const storefront = createStorefrontClient(getStoredCartToken());
      await storefront.cart.addItem({ variantId, quantity: 1 });
      setStoredCartToken(storefront.cartToken);
      router.push("/cart");
    } catch {
      setStatus("error");
    }
  }

  if (inStock.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        Out of stock.
      </p>
    );
  }

  return (
    <div>
      {variants.length > 1 ? (
        <select
          value={variantId}
          onChange={(e) => setVariantId(Number(e.target.value))}
          className="mb-4 w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        >
          {inStock.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variantLabel(variant)}
            </option>
          ))}
        </select>
      ) : null}
      <button
        onClick={handleClick}
        disabled={status === "adding"}
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {status === "adding" ? "Adding…" : "Add to cart"}
      </button>
      {status === "error" ? (
        <p className="mt-2 text-sm text-red-600">
          Couldn&apos;t add that to your cart — try again.
        </p>
      ) : null}
    </div>
  );
}
