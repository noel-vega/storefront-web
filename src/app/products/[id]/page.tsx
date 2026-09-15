import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createStorefrontClient } from "@/lib/storefront";
import { VariantPicker } from "@/components/variant-picker";

// per-tenant, live data — see src/app/page.tsx
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/products/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const storefront = createStorefrontClient();
  const product = await storefront.products.getById(Number(id));

  if (!product) return {};

  const image = product.images[0]?.url;
  const description = product.description ?? undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage(
  props: PageProps<"/products/[id]">,
) {
  const { id } = await props.params;
  const storefront = createStorefrontClient();
  const product = await storefront.products.getById(Number(id));

  if (!product) notFound();

  const image = product.images[0];
  const prices = product.variants.map((v) => v.priceCents);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const inStock = product.variants.some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    offers:
      minPrice === maxPrice
        ? {
            "@type": "Offer",
            priceCurrency: "USD",
            price: (minPrice / 100).toFixed(2),
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          }
        : {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: (minPrice / 100).toFixed(2),
            highPrice: (maxPrice / 100).toFixed(2),
            offerCount: product.variants.length,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <h1 className="mt-6 text-2xl font-medium">{product.name}</h1>
      {product.description ? (
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {product.description}
        </p>
      ) : null}
      <div className="mt-6">
        <VariantPicker variants={product.variants} />
      </div>
    </div>
  );
}
