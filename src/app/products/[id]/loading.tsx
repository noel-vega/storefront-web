import { ProductDetailSkeleton } from "@/components/skeletons";

// Trade-off: with this boundary the response starts streaming before the
// product fetch resolves, so a missing product's notFound() can no longer set
// a 404 status — it ships as 200 with Next's injected
// <meta name="robots" content="noindex">, which keeps it out of search
// results. Same for categories/brands.
export default function Loading() {
  return <ProductDetailSkeleton />;
}
