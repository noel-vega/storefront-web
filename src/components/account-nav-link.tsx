"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getStoredRefreshToken,
  subscribeToRefreshTokenChanges,
} from "@/lib/auth-token";

function getSnapshot() {
  return !!getStoredRefreshToken();
}

function getServerSnapshot() {
  return false;
}

// layout.tsx is a Server Component with no visibility into localStorage, so
// this reads the signed-in state client-side via useSyncExternalStore —
// re-renders on both same-tab changes (sign in/out on this page) and
// other-tab changes, unlike a plain useEffect keyed on navigation.
export function AccountNavLink() {
  const signedIn = useSyncExternalStore(
    subscribeToRefreshTokenChanges,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <Link
      href={signedIn ? "/account" : "/signin"}
      className="text-sm text-black/60 hover:underline dark:text-white/60"
    >
      {signedIn ? "Account" : "Sign in"}
    </Link>
  );
}
