import { notFound } from "next/navigation";
import { createStorefrontClient } from "@/lib/storefront";
import { VariantPicker } from "@/components/variant-picker";

// per-tenant, live data — see src/app/page.tsx
export const dynamic = "force-dynamic";

export default async function ProductDetailPage(
  props: PageProps<"/products/[id]">,
) {
  const { id } = await props.params;
  const storefront = createStorefrontClient();
  const product = await storefront.products.getById(Number(id));

  if (!product) notFound();

  const image = product.images[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
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
