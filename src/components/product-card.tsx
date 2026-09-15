import Link from "next/link";
import type { ProductListItem } from "@ordersail/storefront-sdk";
import { formatPrice } from "@/lib/format";

const badgeClassName =
  "rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/60 hover:border-black/30 hover:text-black dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <li>
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
      {product.brand || product.categories.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {product.brand ? (
            <Link href={`/brands/${product.brand.id}`} className={badgeClassName}>
              {product.brand.name}
            </Link>
          ) : null}
          {product.categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className={badgeClassName}
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}
    </li>
  );
}
