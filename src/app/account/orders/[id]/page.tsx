import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailView } from "./order-detail";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

// Server wrapper only to validate the id — the order itself needs the
// customer's refresh token, so OrderDetailView fetches client-side.
export default async function OrderDetailPage(
  props: PageProps<"/account/orders/[id]">,
) {
  const { id } = await props.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  return <OrderDetailView orderId={orderId} />;
}
