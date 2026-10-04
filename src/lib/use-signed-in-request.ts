"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@ordersail/storefront-sdk";
import { getStorefrontClient } from "@/lib/storefront";

type StorefrontClient = ReturnType<typeof getStorefrontClient>;

export type SignedInRequestState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; data: T };

// Runs an authenticated request on mount, for pages that only make sense
// signed in. A 401 means the stored refresh token is missing, expired or
// revoked, so it redirects to /signin rather than showing an error.
//
// Concurrent calls are safe: the tab shares one client (getStorefrontClient)
// and the SDK shares its token refresh between them — so StrictMode's
// double-invoked effect just makes a second, harmless request. Remount
// (e.g. `key`) to run it again.
export function useSignedInRequest<T>(
  request: (storefront: StorefrontClient) => Promise<T>,
): SignedInRequestState<T> {
  const router = useRouter();
  const [state, setState] = useState<SignedInRequestState<T>>({
    status: "loading",
  });
  // the latest callback without making it an effect dependency — the
  // request runs once per mount, not on every render
  const requestRef = useRef(request);

  useEffect(() => {
    let cancelled = false;

    requestRef
      .current(getStorefrontClient())
      .then((data) => {
        if (!cancelled) setState({ status: "done", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/signin");
          return;
        }
        setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return state;
}
