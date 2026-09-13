"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createStorefrontClient } from "@/lib/storefront";
import { getStoredCartToken, setStoredCartToken } from "@/lib/cart-token";

// - complete    : paid — the order is on its way (a webhook creates it)
// - unconfirmed : checkout finished but the payment hasn't settled (a
//                 delayed method still pending, or one that failed) — cart kept
// - unfinished  : the session expired or was abandoned before paying
// - error       : no session id, or the status lookup itself failed
type Status = "loading" | "unfinished" | "unconfirmed" | "complete" | "error";

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
          Checking your order…
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  // no session id is a render-time fact, not something to discover in an
  // effect — derive the initial status from it directly
  const [status, setStatus] = useState<Status>(
    sessionId ? "loading" : "error",
  );
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  // embedded checkout has no server-confirmed redirect like a hosted flow
  // would — the order itself is still created by a webhook server-side,
  // this just checks payment status to decide what to show the customer
  useEffect(() => {
    if (!sessionId) return;
    let ignore = false;
    const storefront = createStorefrontClient(getStoredCartToken());
    storefront.checkout
      .getSessionStatus(sessionId)
      .then((result) => {
        if (ignore) return;
        if (!result) {
          setStatus("error");
          return;
        }
        setCustomerEmail(result.customerEmail);
        if (result.status === "complete" && result.paymentStatus === "paid") {
          // only a confirmed-paid checkout empties the cart — an unsettled
          // async payment might still fail, so the customer keeps it to retry
          setStoredCartToken(undefined);
          setStatus("complete");
        } else if (result.status === "complete") {
          setStatus("unconfirmed");
        } else {
          setStatus("unfinished");
        }
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-black/60 dark:text-white/60">
        Checking your order…
      </div>
    );
  }

  if (status === "unfinished") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Checkout wasn&apos;t completed</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Your payment wasn&apos;t finished — you can try again.
        </p>
        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Return to checkout
        </Link>
      </div>
    );
  }

  if (status === "unconfirmed") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">
          We couldn&apos;t confirm your payment
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {customerEmail
            ? `We'll email ${customerEmail} as soon as it clears. If it doesn't go through, your cart is still saved so you can try another method.`
            : "We'll confirm by email as soon as it clears. If it doesn't go through, your cart is still saved so you can try another method."}
        </p>
        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-full border border-black/10 px-6 py-3 text-sm font-medium dark:border-white/15"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-2xl font-medium">Something went wrong</h1>
        <Link
          href="/cart"
          className="mt-4 inline-block text-sm text-black/60 hover:underline dark:text-white/60"
        >
          ← Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="text-2xl font-medium">Thanks for your order!</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        {customerEmail
          ? `We've sent a confirmation to ${customerEmail}.`
          : "We've received your payment and are getting your order ready."}
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Continue shopping
      </Link>
    </div>
  );
}
