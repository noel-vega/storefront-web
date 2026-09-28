// Placeholders for the loading.tsx files — shaped like the real pages so
// nothing shifts when the streamed content swaps in.

const block = "animate-pulse rounded-md bg-black/5 dark:bg-white/10";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className={`aspect-square rounded-lg ${block}`} />
          <div className={`mt-2 h-4 w-3/4 ${block}`} />
          <div className={`mt-1 h-4 w-1/4 ${block}`} />
        </li>
      ))}
    </ul>
  );
}

export function ProductListingSkeleton({ filters }: { filters?: boolean }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12" role="status">
      <span className="sr-only">Loading products…</span>
      <div className={`h-8 w-40 ${block}`} />
      {filters ? <div className={`mt-6 h-16 w-full ${block}`} /> : null}
      <ProductGridSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12" role="status">
      <span className="sr-only">Loading product…</span>
      <div className={`aspect-square rounded-lg ${block}`} aria-hidden />
      <div className={`mt-6 h-8 w-2/3 ${block}`} aria-hidden />
      <div className={`mt-2 h-4 w-full ${block}`} aria-hidden />
      <div className={`mt-6 h-10 w-1/2 ${block}`} aria-hidden />
    </div>
  );
}
