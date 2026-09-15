import { notFound } from "next/navigation";
import { createStorefrontClient } from "@/lib/storefront";
import { firstValue } from "@/lib/search-params";
import { ProductCard } from "@/components/product-card";
import { PaginationNav } from "@/components/pagination-nav";

// per-tenant, live data — see src/app/page.tsx
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function CategoryPage(
  props: PageProps<"/categories/[id]">,
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const storefront = createStorefrontClient();
  const category = await storefront.categories.getById(Number(id), {
    limit: PAGE_SIZE,
    offset,
  });

  if (!category) notFound();

  const totalPages = Math.max(
    1,
    Math.ceil(category.products.total / PAGE_SIZE),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">{category.name}</h1>

      {category.products.items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-black/60 dark:text-white/60">
          No products in this category yet.
        </p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {category.products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            buildHref={(p) =>
              p > 1 ? `/categories/${id}?page=${p}` : `/categories/${id}`
            }
          />
        </>
      )}
    </div>
  );
}
