"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import {
  formatOrderDate,
  orderStatusLabel,
  safeTrackingUrl,
  type OrderDetail,
  type OrderFulfillment,
} from "@/lib/orders";
import { useSignedInRequest } from "@/lib/use-signed-in-request";

const mutedText = "text-sm text-black/60 dark:text-white/60";

export function OrderDetailView({ orderId }: { orderId: number }) {
  const state = useSignedInRequest((storefront) =>
    storefront.customer.orders.getById(orderId),
  );

  if (state.status === "error") {
    return (
      <Message title="Couldn't load this order">
        Something went wrong — try refreshing the page.
      </Message>
    );
  }

  if (state.status === "loading") {
    return (
      <div className={`mx-auto max-w-2xl px-6 py-12 text-center ${mutedText}`}>
        Loading…
      </div>
    );
  }

  // undefined = 404: no such order, or it isn't this customer's — the API
  // deliberately doesn't say which
  if (!state.data) {
    return (
      <Message title="Order not found">
        We couldn&apos;t find that order on your account.
      </Message>
    );
  }

  return <OrderDetailContent order={state.data} />;
}

function OrderDetailContent({ order }: { order: OrderDetail }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/account/orders" className={`${mutedText} hover:underline`}>
        ← Your orders
      </Link>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-medium">Order #{order.id}</h1>
        <span className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/15">
          {orderStatusLabel(order)}
        </span>
      </div>
      <p className={`mt-1 ${mutedText}`}>
        Placed {formatOrderDate(order.createdAt)}
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium">Items</h2>
        <ul className="mt-2 divide-y divide-black/10 border-y border-black/10 dark:divide-white/15 dark:border-white/15">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <div>
                <p className="text-sm">{item.productName}</p>
                <p className={mutedText}>
                  {[item.optionsLabel, `Qty ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {item.refundedQuantity > 0 ? (
                  <p className={mutedText}>
                    {item.refundedQuantity} refunded
                  </p>
                ) : null}
              </div>
              <p className="text-sm">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
          <TotalRow label="Subtotal" cents={order.subtotalCents} />
          <TotalRow label="Shipping" cents={order.shippingCents} />
          <TotalRow label="Tax" cents={order.taxCents} />
          <div className="flex justify-between pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.amountTotalCents)}</dd>
          </div>
        </dl>
      </section>

      {order.fulfillments.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium">
            {order.fulfillments.length === 1 ? "Shipment" : "Shipments"}
          </h2>
          <ul className="mt-2 space-y-3">
            {order.fulfillments.map((fulfillment) => (
              <Shipment
                key={fulfillment.id}
                fulfillment={fulfillment}
                items={order.items}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {order.shipping ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium">Shipping to</h2>
          <address className={`mt-2 not-italic ${mutedText}`}>
            {order.customerName ? <>{order.customerName}<br /></> : null}
            {order.shipping.line1}
            <br />
            {order.shipping.line2 ? <>{order.shipping.line2}<br /></> : null}
            {order.shipping.city}
            {order.shipping.state ? `, ${order.shipping.state}` : ""}{" "}
            {order.shipping.postalCode}
            <br />
            {order.shipping.country}
          </address>
        </section>
      ) : null}
    </div>
  );
}

function Shipment({
  fulfillment,
  items,
}: {
  fulfillment: OrderFulfillment;
  items: OrderDetail["items"];
}) {
  const trackingUrl = safeTrackingUrl(fulfillment.trackingUrl);
  const carrier = [
    fulfillment.shippingCarrier,
    fulfillment.shippingServiceLevel,
  ]
    .filter(Boolean)
    .join(" · ");
  const productName = (orderItemId: number) =>
    items.find((item) => item.id === orderItemId)?.productName ?? "Item";

  return (
    <li className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{carrier || "Shipped"}</p>
        <p className={mutedText}>{formatOrderDate(fulfillment.createdAt)}</p>
      </div>
      {fulfillment.trackingNumber ? (
        <p className={`mt-1 ${mutedText}`}>
          Tracking{" "}
          {trackingUrl ? (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-foreground underline"
            >
              {fulfillment.trackingNumber}
            </a>
          ) : (
            <span className="font-mono">{fulfillment.trackingNumber}</span>
          )}
        </p>
      ) : trackingUrl ? (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm underline"
        >
          Track package
        </a>
      ) : null}
      {fulfillment.items.length > 0 ? (
        <ul className={`mt-2 ${mutedText}`}>
          {fulfillment.items.map((line) => (
            <li key={line.orderItemId}>
              {productName(line.orderItemId)} × {line.quantity}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function TotalRow({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-black/60 dark:text-white/60">{label}</dt>
      <dd>{formatPrice(cents)}</dd>
    </div>
  );
}

function Message({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-center">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className={`mt-2 ${mutedText}`}>{children}</p>
      <Link
        href="/account/orders"
        className="mt-4 inline-block text-sm underline"
      >
        Back to your orders
      </Link>
    </div>
  );
}
