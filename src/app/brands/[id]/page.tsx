import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createStorefrontClient } from "@/lib/storefront";
import { firstValue } from "@/lib/search-params";
import { ProductCard } from "@/components/product-card";
import { PaginationNav } from "@/components/pagination-nav";

// per-tenant, live data — see src/app/page.tsx
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function generateMetadata(
  props: PageProps<"/brands/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const storefront = createStorefrontClient();
  const brand = await storefront.brands.getById(Number(id));

  if (!brand) return {};

  const title = brand.name;
  const description = `Shop ${brand.name} at Storefront.`;

  return {
    title,
    description,
    alternates: { canonical: `/brands/${id}` },
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function BrandPage(props: PageProps<"/brands/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const storefront = createStorefrontClient();
  const brand = await storefront.brands.getById(Number(id), {
    limit: PAGE_SIZE,
    offset,
  });

  if (!brand) notFound();

  const totalPages = Math.max(1, Math.ceil(brand.products.total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">{brand.name}</h1>

      {brand.products.items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-black/60 dark:text-white/60">
          No products from this brand yet.
        </p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {brand.products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            buildHref={(p) => (p > 1 ? `/brands/${id}?page=${p}` : `/brands/${id}`)}
          />
        </>
      )}
    </div>
  );
}
