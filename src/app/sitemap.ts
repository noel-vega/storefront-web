import type { MetadataRoute } from "next";
import { createStorefrontClient } from "@/lib/storefront";

// storefront-api's own max page size (see FILTER_OPTIONS_LIMIT in
// src/app/page.tsx) — use it to walk each resource in as few requests as
// possible.
const PAGE_SIZE = 100;

// Per-tenant, live data — same reasoning as the dynamic = "force-dynamic"
// pages (src/app/page.tsx): the catalog isn't knowable at build time.
export const dynamic = "force-dynamic";

async function collectAllIds(
  list: (query: {
    limit: number;
    offset: number;
  }) => Promise<{ items: { id: number }[]; total: number }>,
): Promise<number[]> {
  const ids: number[] = [];
  let offset = 0;
  for (;;) {
    const page = await list({ limit: PAGE_SIZE, offset });
    ids.push(...page.items.map((item) => item.id));
    offset += PAGE_SIZE;
    if (offset >= page.total) break;
  }
  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const storefront = createStorefrontClient();

  const [productIds, categoryIds, brandIds] = await Promise.all([
    collectAllIds(storefront.products.list),
    collectAllIds(storefront.categories.list),
    collectAllIds(storefront.brands.list),
  ]);

  return [
    { url: siteUrl },
    ...productIds.map((id) => ({ url: `${siteUrl}/products/${id}` })),
    ...categoryIds.map((id) => ({ url: `${siteUrl}/categories/${id}` })),
    ...brandIds.map((id) => ({ url: `${siteUrl}/brands/${id}` })),
  ];
}
