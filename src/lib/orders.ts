import type { createStorefrontClient } from "@/lib/storefront";

// The SDK doesn't export named order types yet, so derive them from the
// methods that return them.
type OrdersResource = ReturnType<
  typeof createStorefrontClient
>["customer"]["orders"];

export type OrderSummary = Awaited<
  ReturnType<OrdersResource["list"]>
>["items"][number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<OrdersResource["getById"]>>
>;
export type OrderFulfillment = OrderDetail["fulfillments"][number];

// One customer-facing label from the two status axes. Payment problems and
// refunds take precedence; for a paid order what the customer cares about
// is whether it has shipped.
export function orderStatusLabel(
  order: Pick<OrderSummary, "status" | "fulfillmentStatus">,
): string {
  switch (order.status) {
    case "pending":
      return "Payment pending";
    case "payment_failed":
      return "Payment failed";
    case "canceled":
      return "Canceled";
    case "refunded":
      return "Refunded";
    case "partially_refunded":
      return "Partially refunded";
    case "paid":
      switch (order.fulfillmentStatus) {
        case "fulfilled":
          return "Shipped";
        case "partially_fulfilled":
          return "Partially shipped";
        case "unfulfilled":
          return "Processing";
      }
  }
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Tracking URLs are merchant/carrier-supplied — only ever render http(s)
// ones as links, never a javascript: or data: URL.
export function safeTrackingUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
