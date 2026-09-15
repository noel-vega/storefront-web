import Link from "next/link";
import { createStorefrontClient } from "@/lib/storefront";
import { formatPrice } from "@/lib/format";

// Catalog data is per-tenant and live, not knowable at build time — force
// dynamic rendering instead of the static prerender Next would otherwise
// attempt (which would fail the build with no storefront-api reachable).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Preserves the current search term across pagination links; page 1 is the
// implicit default so it's left off the URL.
function pageHref(page: number, q: string | undefined): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

// Server Component: runs on the Next.js server, calling storefront-api
// server-to-server — no CORS involved here, unlike the cart/checkout pages.
export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const q = firstValue(searchParams.q)?.trim() || undefined;
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const storefront = createStorefrontClient();
  const products = await storefront.products.list({
    q,
    limit: PAGE_SIZE,
    offset,
  });
  const totalPages = Math.max(1, Math.ceil(products.total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">Products</h1>

      {/* A plain GET form — no client JS needed, submitting navigates to
          /?q=... and always resets to page 1 (no page field to carry over). */}
      <form action="/" method="GET" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search products…"
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/15"
        >
          Search
        </button>
      </form>

      {products.items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-black/60 dark:text-white/60">
          {q ? `No products match "${q}".` : "No products yet."}
        </p>
      ) : (
        <>
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

          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-4 text-sm">
              {page > 1 ? (
                <Link href={pageHref(page - 1, q)} className="underline">
                  Previous
                </Link>
              ) : (
                <span className="text-black/30 dark:text-white/30">
                  Previous
                </span>
              )}
              <span className="text-black/60 dark:text-white/60">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1, q)} className="underline">
                  Next
                </Link>
              ) : (
                <span className="text-black/30 dark:text-white/30">Next</span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
