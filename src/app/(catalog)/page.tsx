import { createStorefrontClient } from "@/lib/storefront";
import { firstValue } from "@/lib/search-params";
import { ProductCard } from "@/components/product-card";
import { PaginationNav } from "@/components/pagination-nav";

// Catalog data is per-tenant and live, not knowable at build time — force
// dynamic rendering instead of the static prerender Next would otherwise
// attempt (which would fail the build with no storefront-api reachable).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
// A <select> needs "all" categories/brands up front, not a paginated slice —
// 100 is the API's own max page size, plenty for a reference storefront.
const FILTER_OPTIONS_LIMIT = 100;

type SortBy = "price" | "newest" | "name";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: Record<string, { sortBy: SortBy; sortDir: SortDir }> = {
  "price-asc": { sortBy: "price", sortDir: "asc" },
  "price-desc": { sortBy: "price", sortDir: "desc" },
  "newest-desc": { sortBy: "newest", sortDir: "desc" },
  "newest-asc": { sortBy: "newest", sortDir: "asc" },
  "name-asc": { sortBy: "name", sortDir: "asc" },
  "name-desc": { sortBy: "name", sortDir: "desc" },
};
const SORT_LABELS: Record<string, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "newest-desc": "Newest",
  "newest-asc": "Oldest",
  "name-asc": "Name: A to Z",
  "name-desc": "Name: Z to A",
};

// Dollars (what the price inputs show) to cents (what the API takes).
// Invalid/blank input is treated as "no bound", not zero.
function toCents(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const dollars = Number(value);
  return Number.isFinite(dollars) ? Math.round(dollars * 100) : undefined;
}

interface Filters {
  q: string | undefined;
  categoryId: number | undefined;
  brandId: number | undefined;
  minPrice: string | undefined;
  maxPrice: string | undefined;
  inStock: boolean;
  sort: string | undefined;
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): Filters {
  const categoryId = Number(firstValue(searchParams.category));
  const brandId = Number(firstValue(searchParams.brand));
  return {
    q: firstValue(searchParams.q)?.trim() || undefined,
    categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined,
    brandId: Number.isFinite(brandId) && brandId > 0 ? brandId : undefined,
    minPrice: firstValue(searchParams.minPrice) || undefined,
    maxPrice: firstValue(searchParams.maxPrice) || undefined,
    inStock: firstValue(searchParams.inStock) === "true",
    sort: firstValue(searchParams.sort) || undefined,
  };
}

// Preserves every active filter across pagination links; page 1 is the
// implicit default so it's left off the URL.
function pageHref(page: number, filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("category", String(filters.categoryId));
  if (filters.brandId) params.set("brand", String(filters.brandId));
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.inStock) params.set("inStock", "true");
  if (filters.sort) params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

// Server Component: runs on the Next.js server, calling storefront-api
// server-to-server — no CORS involved here, unlike the cart/checkout pages.
export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const filters = parseFilters(searchParams);
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const sort = filters.sort ? SORT_OPTIONS[filters.sort] : undefined;

  const storefront = createStorefrontClient();
  const [products, categories, brands] = await Promise.all([
    storefront.products.list({
      q: filters.q,
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      minPriceCents: toCents(filters.minPrice),
      maxPriceCents: toCents(filters.maxPrice),
      inStock: filters.inStock || undefined,
      sortBy: sort?.sortBy,
      sortDir: sort?.sortDir,
      limit: PAGE_SIZE,
      offset,
    }),
    storefront.categories.list({ limit: FILTER_OPTIONS_LIMIT }),
    storefront.brands.list({ limit: FILTER_OPTIONS_LIMIT }),
  ]);
  const totalPages = Math.max(1, Math.ceil(products.total / PAGE_SIZE));
  const hasFilters =
    filters.q ||
    filters.categoryId ||
    filters.brandId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">Products</h1>

      {/* A plain GET form — no client JS needed. Submitting navigates to
          /?q=...&category=...&... and always resets to page 1 (no page
          field to carry over). */}
      <form
        action="/"
        method="GET"
        className="mt-6 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 basis-full sm:basis-auto">
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Search
          </label>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search products…"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Category
          </label>
          <select
            name="category"
            defaultValue={filters.categoryId ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          >
            <option value="">All</option>
            {categories.items.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Brand
          </label>
          <select
            name="brand"
            defaultValue={filters.brandId ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          >
            <option value="">All</option>
            {brands.items.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Min price
          </label>
          <input
            type="number"
            name="minPrice"
            min={0}
            step="0.01"
            defaultValue={filters.minPrice ?? ""}
            placeholder="$0"
            className="w-24 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Max price
          </label>
          <input
            type="number"
            name="maxPrice"
            min={0}
            step="0.01"
            defaultValue={filters.maxPrice ?? ""}
            placeholder="Any"
            className="w-24 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="inStock"
            value="true"
            defaultChecked={filters.inStock}
          />
          In stock only
        </label>

        <div>
          <label className="mb-1 block text-xs text-black/60 dark:text-white/60">
            Sort by
          </label>
          <select
            name="sort"
            defaultValue={filters.sort ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          >
            <option value="">Featured</option>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-md border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/15"
        >
          Apply
        </button>
      </form>

      {products.items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-black/60 dark:text-white/60">
          {hasFilters
            ? "No products match these filters."
            : "No products yet."}
        </p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            buildHref={(p) => pageHref(p, filters)}
          />
        </>
      )}
    </div>
  );
}
