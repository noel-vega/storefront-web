import Link from "next/link";
import { createStorefrontClient } from "@/lib/storefront";
import { formatPrice } from "@/lib/format";

// Catalog data is per-tenant and live, not knowable at build time — force
// dynamic rendering instead of the static prerender Next would otherwise
// attempt (which would fail the build with no storefront-api reachable).
export const dynamic = "force-dynamic";

// Server Component: runs on the Next.js server, calling storefront-api
// server-to-server — no CORS involved here, unlike the cart/checkout pages.
export default async function HomePage() {
  const storefront = createStorefrontClient();
  const products = await storefront.products.list();

  if (products.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-black/60 dark:text-white/60">
        No products yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">Products</h1>
      <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {products.items.map((product) => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                {product.thumbnailUrl ? (
                  // external, per-tenant images — no next.config.js remotePatterns to maintain here
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium">{product.name}</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {product.minPriceCents !== null
                  ? formatPrice(product.minPriceCents)
                  : "—"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
