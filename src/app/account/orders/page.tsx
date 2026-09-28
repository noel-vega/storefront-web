import type { Metadata } from "next";
import { firstValue } from "@/lib/search-params";
import { OrderHistory } from "./order-history";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false },
};

// Server wrapper only to read ?page= — the orders themselves need the
// customer's refresh token, which lives in localStorage, so OrderHistory
// fetches client-side. Keyed by page so each page is a fresh mount (and a
// fresh one-shot request — see useSignedInRequest).
export default async function OrdersPage(props: PageProps<"/account/orders">) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  return <OrderHistory key={page} page={page} />;
}
