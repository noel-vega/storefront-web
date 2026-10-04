"use client"; // error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

// Root error boundary — catches a failed storefront-api fetch on any page
// under the root layout (listing, product, category, brand), keeping the
// header. In production a Server Component's error.message is a generic
// string, so it isn't shown; the digest matches the server log line.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-sm px-6 py-24 text-center" role="alert">
      <h1 className="text-2xl font-medium">Something went wrong</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        We couldn&apos;t load this page. It&apos;s probably temporary — try
        again in a moment.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => retry()}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-black/60 hover:underline dark:text-white/60"
        >
          Back to products
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-xs text-black/40 dark:text-white/40">
          Error ID: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
