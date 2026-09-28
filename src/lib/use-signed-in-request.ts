"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@ordersail/storefront-sdk";
import { createStorefrontClient } from "@/lib/storefront";

type StorefrontClient = ReturnType<typeof createStorefrontClient>;

export type SignedInRequestState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; data: T };

// Runs one authenticated request per mount, for pages that only make sense
// signed in. A 401 means the stored refresh token is missing, expired or
// revoked, so it redirects to /signin rather than showing an error.
//
// A fresh client has no access token, so its first call refreshes — and
// refresh tokens are single-use (OS-457): two clients refreshing at once
// make the second one look like reuse and revoke the session. So: one client
// per request, awaited calls in sequence inside `request` (they share the
// access token the first one derived), and a ref guard so StrictMode's
// double-invoked effect can't fire a second refresh. Same reasoning as
// src/app/account/page.tsx. Remount (e.g. `key`) to run it again.
export function useSignedInRequest<T>(
  request: (storefront: StorefrontClient) => Promise<T>,
): SignedInRequestState<T> {
  const router = useRouter();
  const [state, setState] = useState<SignedInRequestState<T>>({
    status: "loading",
  });
  const hasFetchedRef = useRef(false);
  // the latest callback without making it an effect dependency — the ref
  // guard means only the first one ever runs anyway
  const requestRef = useRef(request);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    requestRef
      .current(createStorefrontClient())
      .then((data) => setState({ status: "done", data }))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/signin");
          return;
        }
        setState({ status: "error" });
      });
  }, [router]);

  return state;
}
