import { ProductListingSkeleton } from "@/components/skeletons";

// Scoped to the (catalog) route group rather than src/app/loading.tsx: a root
// loading boundary would wrap every route, so an unmatched URL would stream
// as a soft 404 (200 + noindex) instead of a real 404 status.
export default function Loading() {
  return <ProductListingSkeleton filters />;
}
