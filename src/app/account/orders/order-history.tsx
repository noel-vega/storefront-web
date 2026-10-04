"use client";

import Link from "next/link";
import { PaginationNav } from "@/components/pagination-nav";
import { formatPrice } from "@/lib/format";
import { formatOrderDate, orderStatusLabel } from "@/lib/orders";
import { useSignedInRequest } from "@/lib/use-signed-in-request";

const PAGE_SIZE = 10;

export function OrderHistory({ page }: { page: number }) {
  const state = useSignedInRequest((storefront) =>
    storefront.customer.orders.list({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  );

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Couldn&apos;t load your orders</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Something went wrong — try refreshing the page.
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
        Loading…
      </div>
    );
  }

  const orders = state.data;
  const totalPages = Math.max(1, Math.ceil(orders.total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/account"
        className="text-sm text-black/60 hover:underline dark:text-white/60"
      >
        ← Account
      </Link>
      <h1 className="mt-4 text-2xl font-medium">Your orders</h1>

      {orders.items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-black/60 dark:text-white/60">
            {page > 1
              ? "No orders on this page."
              : "You haven't placed any orders yet."}
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-black/10 border-y border-black/10 dark:divide-white/15 dark:border-white/15">
            {orders.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 py-4 hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                >
                  <div>
                    <p className="text-sm font-medium">Order #{order.id}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {formatOrderDate(order.createdAt)} ·{" "}
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPrice(order.amountTotalCents)}
                    </p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {orderStatusLabel(order)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            buildHref={(p) =>
              p > 1 ? `/account/orders?page=${p}` : "/account/orders"
            }
          />
        </>
      )}
    </div>
  );
}
