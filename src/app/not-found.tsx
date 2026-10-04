import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

// Root not-found: renders for every unmatched URL and for every notFound()
// call below it (products, categories, brands) — inside the root layout, so
// the header and cart link stay put.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24 text-center">
      <p className="text-sm text-black/60 dark:text-white/60">404</p>
      <h1 className="mt-2 text-2xl font-medium">Page not found</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        This page doesn&apos;t exist, or the product is no longer available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Continue shopping
      </Link>
    </div>
  );
}
